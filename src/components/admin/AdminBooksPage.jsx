import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  BookOpen,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import BookCover from '../BookCover';
import { BOOK_CATEGORIES, COVER_PALETTES } from '../../data/libraryData';

const PAGE_SIZE = 6;

const EMPTY_FORM = {
  title: '',
  author: '',
  isbn: '',
  category: 'Computer Science',
  publisher: '',
  year: new Date().getFullYear(),
  shelf: 'CS-08 · Floor 3',
  pages: 320,
  totalCopies: 2,
  synopsis: '',
  coverImage: null,
  coverPalette: COVER_PALETTES[0],
};

export default function AdminBooksPage({
  books,
  initialSearch = '',
  openAddTrigger = 0,
  onAddBook,
  onEditBook,
  onDeleteBook,
}) {
  const [query, setQuery] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [sortBy, setSortBy] = useState({ key: 'title', dir: 'asc' });
  const [page, setPage] = useState(1);

  const [viewBook, setViewBook] = useState(null);
  const [formModal, setFormModal] = useState({ open: false, mode: 'add', book: null });
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (initialSearch !== undefined) {
      setQuery(initialSearch);
      setPage(1);
    }
  }, [initialSearch]);

  useEffect(() => {
    if (openAddTrigger > 0) {
      openAddModal();
    }
  }, [openAddTrigger]);

  const openAddModal = () => {
    setFormState(EMPTY_FORM);
    setFormErrors({});
    setFormModal({ open: true, mode: 'add', book: null });
  };

  const openEditModal = (book) => {
    setFormState({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      category: book.category || 'Computer Science',
      publisher: book.publisher || '',
      year: book.year || new Date().getFullYear(),
      shelf: book.shelf || 'GN-01 · Floor 1',
      pages: book.pages || 250,
      totalCopies: book.totalCopies ?? 1,
      synopsis: book.synopsis || '',
      coverImage: book.coverImage || null,
      coverPalette: book.coverPalette || COVER_PALETTES[0],
    });
    setFormErrors({});
    setFormModal({ open: true, mode: 'edit', book });
  };

  const handleSort = (key) => {
    setSortBy((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  };

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = books.filter((b) => {
      const avail = b.availableCopies ?? (b.status === 'Available' ? 1 : 0);
      const matchesQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q);
      const matchesCat = categoryFilter === 'All' || b.category === categoryFilter;
      const matchesAvail =
        availabilityFilter === 'All' ||
        (availabilityFilter === 'Available' && avail > 0) ||
        (availabilityFilter === 'Borrowed' && avail === 0) ||
        (availabilityFilter === 'Low Stock' && avail === 1);
      return matchesQuery && matchesCat && matchesAvail;
    });

    list.sort((a, b) => {
      const dir = sortBy.dir === 'asc' ? 1 : -1;
      if (sortBy.key === 'availableCopies') {
        const avA = a.availableCopies ?? (a.status === 'Available' ? 1 : 0);
        const avB = b.availableCopies ?? (b.status === 'Available' ? 1 : 0);
        return (avA - avB) * dir;
      }
      if (sortBy.key === 'totalCopies') {
        return ((a.totalCopies ?? 1) - (b.totalCopies ?? 1)) * dir;
      }
      const valA = String(a[sortBy.key] || '').toLowerCase();
      const valB = String(b[sortBy.key] || '').toLowerCase();
      return valA.localeCompare(valB) * dir;
    });

    return list;
  }, [books, query, categoryFilter, availabilityFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedBooks = filteredBooks.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormState((prev) => ({ ...prev, coverImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    const errs = {};
    if (!formState.title.trim()) errs.title = 'Book title is required.';
    if (!formState.author.trim()) errs.author = 'Author name is required.';
    if (!formState.isbn.trim()) errs.isbn = 'ISBN is required.';
    if (!formState.publisher.trim()) errs.publisher = 'Publisher is required.';
    const yr = Number(formState.year);
    if (!yr || yr < 1400 || yr > new Date().getFullYear() + 1) {
      errs.year = 'Enter a valid publication year.';
    }
    const qty = Number(formState.totalCopies);
    if (!qty || qty < 1) {
      errs.totalCopies = 'Quantity must be at least 1.';
    }
    if (!formState.synopsis.trim() || formState.synopsis.trim().length < 15) {
      errs.synopsis = 'Please provide a brief description (at least 15 characters).';
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      if (formModal.mode === 'add') {
        onAddBook({
          ...formState,
          title: formState.title.trim(),
          author: formState.author.trim(),
          isbn: formState.isbn.trim(),
          publisher: formState.publisher.trim(),
          year: Number(formState.year),
          pages: Number(formState.pages) || 280,
          totalCopies: Number(formState.totalCopies),
          synopsis: formState.synopsis.trim(),
        });
      } else if (formModal.book) {
        onEditBook(formModal.book.id, {
          ...formState,
          title: formState.title.trim(),
          author: formState.author.trim(),
          isbn: formState.isbn.trim(),
          publisher: formState.publisher.trim(),
          year: Number(formState.year),
          pages: Number(formState.pages) || 280,
          totalCopies: Number(formState.totalCopies),
          synopsis: formState.synopsis.trim(),
        });
      }
      setIsSaving(false);
      setFormModal({ open: false, mode: 'add', book: null });
    }, 350);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#172A3A] tracking-tight">
            Book Management
          </h1>
          <p className="text-sm text-[#7B8794] mt-1">
            Manage catalog inventory, add new editions, update quantities, and monitor availability.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#172A3A] hover:bg-[#214C52] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-sm transition self-start cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#69B7B0]" />
          Add New Book
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="card-elevated rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#7B8794] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title, author, or ISBN..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-[#F7F8FA]/60 focus:bg-white focus:outline-none focus:border-[#69B7B0] focus:ring-2 focus:ring-[#D9F0E9]/70"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-[#263442] focus:outline-none focus:border-[#69B7B0]"
          >
            {BOOK_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => {
              setAvailabilityFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-[#263442] focus:outline-none focus:border-[#69B7B0]"
          >
            <option value="All">All Availability</option>
            <option value="Available">Available</option>
            <option value="Low Stock">Low Availability (1 copy)</option>
            <option value="Borrowed">All Copies Borrowed</option>
          </select>
        </div>
      </div>

      {/* Book Table */}
      <div className="card-elevated rounded-2xl overflow-hidden">
        {pagedBooks.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#172A3A]">No books match your filters</h3>
            <p className="text-xs text-[#7B8794] mt-1">
              Adjust your search terms or category filter, or add a new book to the catalog.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setCategoryFilter('All');
                setAvailabilityFilter('All');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#172A3A] text-white text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#F7F8FA]/85 text-[11px] font-semibold uppercase tracking-wider text-[#7B8794]">
                    <th className="py-3.5 px-5">
                      <button
                        type="button"
                        onClick={() => handleSort('title')}
                        className="inline-flex items-center gap-1 hover:text-[#172A3A] cursor-pointer"
                      >
                        Book
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleSort('author')}
                        className="inline-flex items-center gap-1 hover:text-[#172A3A] cursor-pointer"
                      >
                        Author
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3.5 px-4">ISBN</th>
                    <th className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleSort('category')}
                        className="inline-flex items-center gap-1 hover:text-[#172A3A] cursor-pointer"
                      >
                        Category
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleSort('totalCopies')}
                        className="inline-flex items-center gap-1 hover:text-[#172A3A] cursor-pointer"
                      >
                        Qty
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleSort('availableCopies')}
                        className="inline-flex items-center gap-1 hover:text-[#172A3A] cursor-pointer"
                      >
                        Available
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {pagedBooks.map((book) => {
                    const total = book.totalCopies ?? 1;
                    const avail = book.availableCopies ?? (book.status === 'Available' ? 1 : 0);
                    return (
                      <tr key={book.id} className="hover:bg-[#F7F8FA]/65 transition">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3 min-w-[210px]">
                            <BookCover book={book} size="xs" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#172A3A] truncate max-w-[220px]">
                                {book.title}
                              </p>
                              <p className="text-[11px] text-[#7B8794]">{book.year} · {book.shelf}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#263442] font-medium whitespace-nowrap">
                          {book.author}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#7B8794] whitespace-nowrap">
                          {book.isbn}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[#263442] text-[11px] font-medium">
                            {book.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-semibold text-[#172A3A]">
                          {total}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-semibold text-[#214C52]">
                          {avail}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              avail === 0
                                ? 'bg-[#B9B5E8]/35 text-[#172A3A]'
                                : avail === 1
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-[#D9F0E9] text-[#214C52]'
                            }`}
                          >
                            {avail === 0 ? 'Borrowed' : avail === 1 ? 'Low Stock' : 'Available'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewBook(book)}
                              title="View Details"
                              className="p-1.5 rounded-lg border border-slate-200 text-[#263442] hover:border-[#69B7B0] hover:text-[#214C52] cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(book)}
                              title="Edit Book"
                              className="p-1.5 rounded-lg border border-slate-200 text-[#263442] hover:border-[#69B7B0] hover:text-[#214C52] cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(book)}
                              title="Delete Book"
                              className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#7B8794]">
              <span>
                Showing {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filteredBooks.length)} of {filteredBooks.length} books
              </span>
              <div className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[#263442] disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2.5 font-medium text-[#172A3A]">
                  Page {safePage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[#263442] disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* View Book Details Modal */}
      {viewBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172A3A]/45 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200/80 animate-modal-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#7B8794]">
                  Catalog ID · {viewBook.id.toUpperCase()}
                </span>
                <h3 className="text-lg font-semibold text-[#172A3A] mt-0.5">Book Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewBook(null)}
                className="p-1.5 rounded-lg text-[#7B8794] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-6">
              <div className="shrink-0 flex justify-center">
                <BookCover book={viewBook} size="lg" className="!w-44" />
              </div>
              <div className="flex-1 space-y-3">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D9F0E9] text-[#214C52]">
                  {viewBook.category}
                </span>
                <h4 className="font-serif text-xl font-medium text-[#172A3A]">{viewBook.title}</h4>
                <p className="text-sm text-[#7B8794]">by {viewBook.author}</p>

                <div className="grid grid-cols-2 gap-2.5 text-xs pt-2">
                  <div className="p-2.5 rounded-xl bg-[#F7F8FA]">
                    <span className="text-[#7B8794] block">ISBN</span>
                    <span className="font-mono font-medium text-[#172A3A]">{viewBook.isbn}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F7F8FA]">
                    <span className="text-[#7B8794] block">Publisher & Year</span>
                    <span className="font-medium text-[#172A3A]">
                      {viewBook.publisher} ({viewBook.year})
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F7F8FA]">
                    <span className="text-[#7B8794] block">Inventory</span>
                    <span className="font-semibold text-[#172A3A]">
                      {viewBook.availableCopies ?? (viewBook.status === 'Available' ? 1 : 0)} of{' '}
                      {viewBook.totalCopies ?? 1} available
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F7F8FA]">
                    <span className="text-[#7B8794] block">Shelf Location</span>
                    <span className="font-mono font-medium text-[#172A3A]">{viewBook.shelf}</span>
                  </div>
                </div>

                <p className="text-xs text-[#263442] leading-relaxed pt-1">{viewBook.synopsis}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  const b = viewBook;
                  setViewBook(null);
                  openEditModal(b);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#172A3A] hover:border-[#69B7B0] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Book
              </button>
              <button
                type="button"
                onClick={() => setViewBook(null)}
                className="px-4 py-2 rounded-xl bg-[#172A3A] text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Book Modal */}
      {formModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172A3A]/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200/80 animate-modal-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#172A3A]">
                  {formModal.mode === 'add' ? 'Add New Book to Catalog' : 'Edit Book Details'}
                </h3>
                <p className="text-xs text-[#7B8794] mt-0.5">
                  {formModal.mode === 'add'
                    ? 'Enter bibliographic details and inventory quantity.'
                    : `Updating catalog entry for "${formModal.book?.title}"`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => !isSaving && setFormModal({ open: false, mode: 'add', book: null })}
                className="p-1.5 rounded-lg text-[#7B8794] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#263442] mb-1">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    value={formState.title}
                    onChange={(e) => setFormState((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g., Introduction to Algorithms"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0]"
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-xs text-rose-600">{formErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263442] mb-1">
                    Author *
                  </label>
                  <input
                    type="text"
                    value={formState.author}
                    onChange={(e) => setFormState((p) => ({ ...p, author: e.target.value }))}
                    placeholder="e.g., Thomas H. Cormen"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0]"
                  />
                  {formErrors.author && (
                    <p className="mt-1 text-xs text-rose-600">{formErrors.author}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263442] mb-1">
                    ISBN *
                  </label>
                  <input
                    type="text"
                    value={formState.isbn}
                    onChange={(e) => setFormState((p) => ({ ...p, isbn: e.target.value }))}
                    placeholder="978-0-2620-4630-5"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-[#69B7B0]"
                  />
                  {formErrors.isbn && (
                    <p className="mt-1 text-xs text-rose-600">{formErrors.isbn}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263442] mb-1">
                    Category
                  </label>
                  <select
                    value={formState.category}
                    onChange={(e) => setFormState((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#69B7B0]"
                  >
                    {BOOK_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263442] mb-1">
                    Publisher *
                  </label>
                  <input
                    type="text"
                    value={formState.publisher}
                    onChange={(e) => setFormState((p) => ({ ...p, publisher: e.target.value }))}
                    placeholder="e.g., MIT Press"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0]"
                  />
                  {formErrors.publisher && (
                    <p className="mt-1 text-xs text-rose-600">{formErrors.publisher}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263442] mb-1">
                    Publication Year *
                  </label>
                  <input
                    type="number"
                    value={formState.year}
                    onChange={(e) => setFormState((p) => ({ ...p, year: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0]"
                  />
                  {formErrors.year && (
                    <p className="mt-1 text-xs text-rose-600">{formErrors.year}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263442] mb-1">
                    Total Quantity *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formState.totalCopies}
                    onChange={(e) => setFormState((p) => ({ ...p, totalCopies: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0]"
                  />
                  {formErrors.totalCopies && (
                    <p className="mt-1 text-xs text-rose-600">{formErrors.totalCopies}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#263442] mb-1">
                    Book Description *
                  </label>
                  <textarea
                    rows={3}
                    value={formState.synopsis}
                    onChange={(e) => setFormState((p) => ({ ...p, synopsis: e.target.value }))}
                    placeholder="Concise academic synopsis of the volume..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#69B7B0]"
                  />
                  {formErrors.synopsis && (
                    <p className="mt-1 text-xs text-rose-600">{formErrors.synopsis}</p>
                  )}
                </div>

                {/* Book Cover Upload & Preview */}
                <div className="sm:col-span-2 p-4 rounded-xl bg-[#F7F8FA] border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <BookCover
                      book={{
                        title: formState.title || 'Preview Title',
                        author: formState.author || 'Author',
                        category: formState.category,
                        year: formState.year,
                        coverImage: formState.coverImage,
                        coverPalette: formState.coverPalette,
                      }}
                      size="sm"
                    />
                    <div>
                      <p className="text-xs font-semibold text-[#172A3A]">Book Cover Artwork</p>
                      <p className="text-[11px] text-[#7B8794] mt-0.5">
                        Upload a cover image or choose an Aurora editorial palette.
                      </p>
                      <div className="mt-2 flex items-center gap-1.5">
                        {COVER_PALETTES.map((pal) => (
                          <button
                            key={pal.label}
                            type="button"
                            onClick={() =>
                              setFormState((p) => ({ ...p, coverImage: null, coverPalette: pal }))
                            }
                            title={pal.label}
                            className="w-5 h-5 rounded-full border border-white shadow-xs cursor-pointer"
                            style={{ background: `linear-gradient(135deg, ${pal.from}, ${pal.to})` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#69B7B0] text-xs font-semibold text-[#172A3A] inline-flex items-center gap-1.5 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      Upload Cover
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                    </label>
                    {formState.coverImage && (
                      <button
                        type="button"
                        onClick={() => setFormState((p) => ({ ...p, coverImage: null }))}
                        className="text-xs text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setFormModal({ open: false, mode: 'add', book: null })}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#263442] hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#172A3A] hover:bg-[#214C52] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172A3A]/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 animate-modal-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#172A3A]">Delete Book from Catalog?</h3>
                <p className="text-xs text-[#7B8794] mt-1 leading-relaxed">
                  Are you sure you want to remove <strong>{deleteTarget.title}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#263442] hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteBook(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
              >
                Delete Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
