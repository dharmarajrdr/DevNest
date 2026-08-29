import { CheatSheetTool } from './CheatSheetTool'
import { DOCKER_COMMANDS } from './data/dockerCommands'

export function DockerCommandsTool() {
  return <CheatSheetTool entries={DOCKER_COMMANDS} />
}
