import { lazy } from 'react'
import {
  Braces, Binary, Link2, Fingerprint, Clock3, Hash, Regex, KeyRound, Palette,
  CaseSensitive, FileText, Dices, Timer as CronIcon, ListChecks, GitBranch, Container, Terminal, Database, GitCompare,
} from 'lucide-react'

/**
 * Each tool is lazy-loaded — the dashboard's initial bundle shouldn't pay
 * for 19 utility panels most sessions never open. React.lazy + Suspense in
 * ToolModal handles the loading state.
 */
export interface DevToolDefinition {
  id: string
  label: string
  icon: typeof Braces
  component: ReturnType<typeof lazy>
}

export const DEV_TOOLS: DevToolDefinition[] = [
  { id: 'diff', label: 'Diff Viewer', icon: GitCompare, component: lazy(() => import('./DiffTool').then((m) => ({ default: m.DiffTool }))) },
  { id: 'json', label: 'JSON Format/Minify', icon: Braces, component: lazy(() => import('./JsonTool').then((m) => ({ default: m.JsonTool }))) },
  { id: 'base64', label: 'Base64', icon: Binary, component: lazy(() => import('./Base64Tool').then((m) => ({ default: m.Base64Tool }))) },
  { id: 'url', label: 'URL Encode/Decode', icon: Link2, component: lazy(() => import('./UrlEncodeTool').then((m) => ({ default: m.UrlEncodeTool }))) },
  { id: 'uuid', label: 'UUID Generator', icon: Fingerprint, component: lazy(() => import('./UuidTool').then((m) => ({ default: m.UuidTool }))) },
  { id: 'timestamp', label: 'Timestamp Converter', icon: Clock3, component: lazy(() => import('./TimestampTool').then((m) => ({ default: m.TimestampTool }))) },
  { id: 'hash', label: 'Hash Generator', icon: Hash, component: lazy(() => import('./HashTool').then((m) => ({ default: m.HashTool }))) },
  { id: 'regex', label: 'Regex Tester', icon: Regex, component: lazy(() => import('./RegexTool').then((m) => ({ default: m.RegexTool }))) },
  { id: 'jwt', label: 'JWT Decoder', icon: KeyRound, component: lazy(() => import('./JwtTool').then((m) => ({ default: m.JwtTool }))) },
  { id: 'color', label: 'Color Converter', icon: Palette, component: lazy(() => import('./ColorTool').then((m) => ({ default: m.ColorTool }))) },
  { id: 'case', label: 'Case Converter', icon: CaseSensitive, component: lazy(() => import('./CaseTool').then((m) => ({ default: m.CaseTool }))) },
  { id: 'lorem', label: 'Lorem Ipsum', icon: FileText, component: lazy(() => import('./LoremTool').then((m) => ({ default: m.LoremTool }))) },
  { id: 'random', label: 'Random String', icon: Dices, component: lazy(() => import('./RandomStringTool').then((m) => ({ default: m.RandomStringTool }))) },
  { id: 'cron', label: 'Cron Helper', icon: CronIcon, component: lazy(() => import('./CronTool').then((m) => ({ default: m.CronTool }))) },
  { id: 'http', label: 'HTTP Status Codes', icon: ListChecks, component: lazy(() => import('./HttpStatusTool').then((m) => ({ default: m.HttpStatusTool }))) },
  { id: 'git', label: 'Git Commands', icon: GitBranch, component: lazy(() => import('./GitCommandsTool').then((m) => ({ default: m.GitCommandsTool }))) },
  { id: 'docker', label: 'Docker Commands', icon: Container, component: lazy(() => import('./DockerCommandsTool').then((m) => ({ default: m.DockerCommandsTool }))) },
  { id: 'linux', label: 'Linux Commands', icon: Terminal, component: lazy(() => import('./LinuxCommandsTool').then((m) => ({ default: m.LinuxCommandsTool }))) },
  { id: 'sql', label: 'SQL Formatter', icon: Database, component: lazy(() => import('./SqlFormatTool').then((m) => ({ default: m.SqlFormatTool }))) },
]
