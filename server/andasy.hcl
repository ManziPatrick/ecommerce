# andasy.hcl app configuration file generated for macyemacyeapi on Wednesday, 28-Jan-26 19:51:04 SAST
#
# See https://github.com/quarksgroup/andasy-cli for information about how to use this file.

app_name = "macyemacyeapi"

app {

  env = {}

  port = 5000

  compute {
    cpu      = 1
    memory   = 512
    cpu_kind = "shared"
  }

  process {
    name = "macyemacyeapi"
  }

}
