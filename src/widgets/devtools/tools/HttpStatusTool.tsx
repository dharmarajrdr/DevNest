import { CheatSheetTool } from './CheatSheetTool'
import { HTTP_STATUS_CODES } from './data/httpStatusCodes'

export function HttpStatusTool() {
  return <CheatSheetTool entries={HTTP_STATUS_CODES} />
}
