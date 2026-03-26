param(
  [Parameter(Mandatory = $true)]
  [string]$CsvPath,

  [string]$OutPath = "app/data/books.json"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-Initials {
  param(
    [string]$Publisher,
    [string]$Title
  )

  $source = if ($Publisher) { $Publisher } else { $Title }
  if (-not $source) { return "BK" }

  $parts = @($source -split '[^\p{L}\p{N}]+' | Where-Object { $_ })
  if ($parts.Count -ge 2) {
    return (($parts[0].Substring(0, 1) + $parts[1].Substring(0, 1)).ToUpperInvariant())
  }

  if ($parts.Count -eq 1) {
    return $parts[0].Substring(0, [Math]::Min(3, $parts[0].Length)).ToUpperInvariant()
  }

  return "BK"
}

function Get-Color {
  param([string]$Publisher)

  switch -Regex ($Publisher) {
    'EYROLLES' { return '#a67cf0' }
    '3dtotal|3D TOTAL' { return '#58c18f' }
    'DAIMON|Spring|Hart' { return '#6ea8ff' }
    'TACO' { return '#ff7ac6' }
    default { return '#6ea8ff' }
  }
}

function Get-Tags {
  param(
    [string]$Title,
    [string]$TagText,
    [string]$Group
  )

  $pool = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
  foreach ($tag in @('character', 'study', 'anatomy', 'morphology')) {
    [void]$pool.Add($tag)
  }

  $text = @($Title, $TagText, $Group) -join ' '
  if ($text -match 'fantasy') { [void]$pool.Add('fantasy'); [void]$pool.Add('stylized') }
  if ($text -match 'bodybuild|superhero') { [void]$pool.Add('realistic'); [void]$pool.Add('superhero') }
  if ($text -match 'vêtement|clothing|plis|fold') { [void]$pool.Add('props') }
  if ($text -match 'realistic|drawing') { [void]$pool.Add('realistic') }
  if ($text -match 'stylized|character') { [void]$pool.Add('stylized') }

  return @($pool | Sort-Object)
}

$csv = Import-Csv -Path $CsvPath
$books = @()
$id = 1

foreach ($row in $csv) {
  if (($row.item_type -ne 'book') -or [string]::IsNullOrWhiteSpace($row.title)) {
    continue
  }

  $publisher = if (-not [string]::IsNullOrWhiteSpace($row.publisher)) {
    $row.publisher.Trim()
  } elseif (-not [string]::IsNullOrWhiteSpace($row.group)) {
    $row.group.Trim()
  } else {
    $row.creators.Trim()
  }

  $isbn13 = [string]$row.ean_isbn13
  $isbn10 = [string]$row.upc_isbn10
  $cover = if ($isbn13) {
    "https://covers.openlibrary.org/b/isbn/$isbn13-L.jpg"
  } elseif ($isbn10) {
    "https://covers.openlibrary.org/b/isbn/$isbn10-L.jpg"
  } else {
    ""
  }

  $book = [ordered]@{
    id = $id
    publisher = $publisher
    title = $row.title.Trim()
    color = Get-Color -Publisher $publisher
    cover = $cover
    initials = Get-Initials -Publisher $publisher -Title $row.title
    isbn13 = $isbn13
    isbn10 = $isbn10
    tags = @(Get-Tags -Title $row.title -TagText $row.tags -Group $row.group)
  }

  $books += [pscustomobject]$book
  $id += 1
}

$targetDir = Split-Path -Parent $OutPath
if ($targetDir) {
  New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
}

$books | ConvertTo-Json -Depth 5 | Set-Content -Path $OutPath -Encoding UTF8
Write-Output "Imported $($books.Count) books to $OutPath"


