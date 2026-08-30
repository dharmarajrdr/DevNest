import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  Globe,
  Library,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { IconButton } from '@/components/ui/IconButton'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useTechBlogStore } from '@/store/useTechBlogStore'
import type { TechBlog } from '@/types'
import { cn } from '@/utils/cn'

export function TechBlogsWidget() {
  const { blogs, loading, load, create, update, remove } = useTechBlogStore()
  const [search, setSearch] = useState('')

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState<TechBlog | null>(null)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)

  // Delete Confirm Modal state
  const [deletingBlog, setDeletingBlog] = useState<TechBlog | null>(null)

  useEffect(() => {
    load()
  }, [load])

  // Sorted alphabetically and searched strictly by name
  const filteredBlogs = useMemo(() => {
    const query = search.trim().toLowerCase()
    const list = blogs.filter((b) => {
      if (!query) return true
      return b.name.toLowerCase().includes(query)
    })

    return [...list].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    )
  }, [blogs, search])

  function handleOpenCreate() {
    setEditingBlog(null)
    setName('')
    setUrl('')
    setCategory('Engineering')
    setDescription('')
    setUrlError(null)
    setModalOpen(true)
  }

  function handleOpenEdit(b: TechBlog) {
    setEditingBlog(b)
    setName(b.name)
    setUrl(b.url)
    setCategory(b.category || 'Engineering')
    setDescription(b.description || '')
    setUrlError(null)
    setModalOpen(true)
  }

  function validateUrl(str: string): string | null {
    const trimmed = str.trim()
    if (!trimmed) return 'URL is required'
    let formatted = trimmed
    if (!/^https?:\/\//i.test(formatted)) {
      formatted = `https://${formatted}`
    }
    try {
      const u = new URL(formatted)
      if (!u.hostname || !u.hostname.includes('.')) {
        return 'Please enter a valid website URL (e.g. https://uber.com/blog)'
      }
      return null
    } catch {
      return 'Please enter a valid website URL'
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    const err = validateUrl(url)
    if (err) {
      setUrlError(err)
      return
    }

    let formattedUrl = url.trim()
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`
    }

    const payload = {
      name: name.trim(),
      url: formattedUrl,
      category: category.trim() || 'General Engineering',
      description: description.trim() || undefined,
    }

    if (editingBlog) {
      await update(editingBlog.id, payload)
    } else {
      await create(payload)
    }

    setModalOpen(false)
  }

  return (
    <>
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Library size={16} className="text-accent" />
            <CardTitle>Tech Blogs</CardTitle>
            <span className="text-[11px] font-semibold text-text-secondary">
              {blogs.length} blogs
            </span>
          </div>

          <div className="flex items-center gap-1">
            <IconButton
              icon={<Plus size={15} />}
              label="Add Tech Blog"
              onClick={handleOpenCreate}
            />
          </div>
        </CardHeader>

        <div className="flex flex-1 flex-col justify-between p-4 pt-1 gap-3 overflow-hidden">
          {/* Search & Category Filter */}
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tech blogs by name (e.g. Uber, Netflix, Google)..."
                className="w-full rounded-lg border border-border bg-bg pl-7 pr-3 py-1 text-[11px] text-text-primary placeholder:text-text-secondary focus:border-accent"
              />
            </div>
          </div>

          {/* Bookshelf / Blog Cards Grid */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="flex-1 animate-pulse" />
            ) : filteredBlogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated text-text-secondary mb-2">
                  <BookOpen size={22} className="opacity-40" />
                </div>
                <h4 className="text-xs font-bold text-text-primary">No tech blogs found</h4>
                <p className="text-[11px] text-text-secondary mt-1 max-w-xs">
                  Add your favorite company engineering blogs to keep up with industry trends.
                </p>
                <Button size="sm" onClick={handleOpenCreate} className="mt-3">
                  <Plus size={13} /> Add First Blog
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                {filteredBlogs.map((blog) => (
                  <BlogCard
                    key={blog.id}
                    blog={blog}
                    onEdit={() => handleOpenEdit(blog)}
                    onDelete={() => setDeletingBlog(blog)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Add / Edit Blog Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBlog ? 'Edit Tech Blog' : 'Add Tech Blog'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="blog-name" className="mb-1 block text-xs font-semibold text-text-primary">
              Blog / Publication Name
            </label>
            <input
              id="blog-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Uber Engineering, Netflix TechBlog..."
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="blog-url" className="mb-1 block text-xs font-semibold text-text-primary">
              Blog URL
            </label>
            <input
              id="blog-url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (urlError) setUrlError(null)
              }}
              placeholder="e.g. https://netflixtechblog.com/"
              className={cn(
                'w-full rounded-lg border bg-bg px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary focus:border-accent',
                urlError ? 'border-danger/60' : 'border-border',
              )}
            />
            {urlError && (
              <p className="mt-1 text-[11px] text-danger animate-fadeIn">{urlError}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !url.trim()}>
              {editingBlog ? 'Save Changes' : 'Add Tech Blog'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deletingBlog)}
        title="Remove Tech Blog?"
        message="Are you sure you want to remove this tech blog from your bookshelf?"
        itemName={deletingBlog?.name || ''}
        confirmLabel="Remove blog"
        onConfirm={async () => {
          if (deletingBlog) {
            await remove(deletingBlog.id)
            setDeletingBlog(null)
          }
        }}
        onCancel={() => setDeletingBlog(null)}
      />
    </>
  )
}

function BlogCard({
  blog,
  onEdit,
  onDelete,
}: {
  blog: TechBlog
  onEdit: () => void
  onDelete: () => void
}) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-border/70 bg-surface-elevated/40 p-3 transition-all hover:border-accent/40 hover:bg-surface-elevated/70 hover:shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-2">
          {/* Logo / Favicon & Name */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface p-1 border border-border/60 shadow-inner">
              {!imgError && blog.iconUrl ? (
                <img
                  src={blog.iconUrl}
                  alt=""
                  className="h-4 w-4 object-contain"
                  onError={() => setImgError(true)}
                />
              ) : (
                <Globe size={14} className="text-text-secondary" />
              )}
            </div>
            <a
              href={blog.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-text-primary hover:text-accent truncate transition-colors"
              title={blog.name}
            >
              {blog.name}
            </a>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <IconButton icon={<Pencil size={11} />} label="Edit blog" onClick={onEdit} />
            <IconButton icon={<Trash2 size={11} />} label="Remove blog" onClick={onDelete} />
          </div>

        </div>

      </div>
    </div>
  )
}
