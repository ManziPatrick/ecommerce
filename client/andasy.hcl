# andasy.hcl app configuration file generated for macyemacye-fn on Wednesday, 04-Feb-26 14:27:07 SAST
#
# See https://github.com/quarksgroup/andasy-cli for information about how to use this file.

app_name = "macyemacye-fn"

app {

  env = {
    HOST = "::"
  }

  port = 3000

  compute {
    cpu      = 1
    memory   = 256
    cpu_kind = "shared"
  }

  process {
    name = "macyemacye-fn"
  }

}
