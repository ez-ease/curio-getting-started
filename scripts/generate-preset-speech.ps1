param(
  [string]$Voice = "Microsoft Zira Desktop"
)

Add-Type -AssemblyName System.Speech

$projectRoot = Split-Path -Parent $PSScriptRoot
$outputDirectory = Join-Path $projectRoot "public\assets\curio\speech"
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null

$presets = @(
  @{
    Id = "sky-blue"
    Text = "Sunlight is made of many colors. Blue light bounces around the sky more than the other colors, so blue reaches our eyes from every direction!"
  },
  @{
    Id = "plants-eat"
    Text = "Plants make their own food! Their leaves use sunlight, water, and air in a process called photosynthesis. It is like a tiny solar-powered kitchen."
  },
  @{
    Id = "moon-light"
    Text = "The Moon does not make its own light. It reflects sunlight, like a giant rocky mirror orbiting Earth."
  }
)

function Convert-VisemeName {
  param([int]$Viseme)

  switch ($Viseme) {
    0 { return "mouthIdle" }
    { $_ -in 1, 2, 4, 6 } { return "aei" }
    { $_ -in 3, 8 } { return "o" }
    5 { return "r" }
    { $_ -in 7, 9, 10, 11 } { return "qwod" }
    12 { return "th" }
    13 { return "r" }
    { $_ -in 14, 15, 19, 20 } { return "cdgknstxyz" }
    16 { return "chjsh" }
    17 { return "th" }
    18 { return "fv" }
    21 { return "bmp" }
    default { return "mouthIdle" }
  }
}

foreach ($preset in $presets) {
  $synthesizer = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $synthesizer.SelectVoice($Voice)
  $cues = [System.Collections.Generic.List[object]]::new()

  $handler = [System.EventHandler[System.Speech.Synthesis.VisemeReachedEventArgs]] {
    param($sender, $eventArgs)

    $cues.Add([PSCustomObject]@{
      timeMs = [Math]::Round($eventArgs.AudioPosition.TotalMilliseconds)
      durationMs = [Math]::Max(1, [Math]::Round($eventArgs.Duration.TotalMilliseconds))
      viseme = Convert-VisemeName $eventArgs.Viseme
    })
  }

  $synthesizer.add_VisemeReached($handler)
  $wavePath = Join-Path $outputDirectory "$($preset.Id).wav"
  $synthesizer.SetOutputToWaveFile($wavePath)

  $escapedText = [System.Security.SecurityElement]::Escape($preset.Text)
  $ssml = @"
<speak version="1.0" xml:lang="en-US">
  <voice name="$Voice">
    <prosody pitch="+18%" rate="+2%">$escapedText</prosody>
  </voice>
</speak>
"@

  $synthesizer.SpeakSsml($ssml)
  $synthesizer.SetOutputToNull()
  $synthesizer.remove_VisemeReached($handler)
  $synthesizer.Dispose()

  $payload = [PSCustomObject]@{
    id = $preset.Id
    text = $preset.Text
    voice = $Voice
    cues = $cues
  }

  $jsonPath = Join-Path $outputDirectory "$($preset.Id).json"
  $payload | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $jsonPath -Encoding utf8
}

Write-Host "Generated $($presets.Count) preset Curio speech tracks in $outputDirectory"
