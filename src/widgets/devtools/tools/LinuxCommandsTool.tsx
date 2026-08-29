import { CheatSheetTool } from './CheatSheetTool'
import { LINUX_COMMANDS } from './data/linuxCommands'

export function LinuxCommandsTool() {
  return <CheatSheetTool entries={LINUX_COMMANDS} />
}
