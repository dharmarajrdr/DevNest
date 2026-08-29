import { CheatSheetTool } from './CheatSheetTool'
import { GIT_COMMANDS } from './data/gitCommands'

export function GitCommandsTool() {
  return <CheatSheetTool entries={GIT_COMMANDS} />
}
