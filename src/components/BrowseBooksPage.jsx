import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  BookOpen,
  X,
  ArrowUpRight,
} from 'lucide-react';
import BookCover from './BookCover';
import { BOOK_CATEGORIES } from '../data/libraryData';

export default function BrowseBooksPage({
  books,
  initialQuery = '',
  defaultView = 'grid',
  onSelectBook,
  onClearGlobalSearch,
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('All');
  const [availability, setAvailability] = useState('All'); // 'All' | 'Available' | 'Borrowed'
  const [viewMode, setViewMode] = useState(defaultView);

  useEffect(() => {
    if (initialQuery !== undefined) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books.filter((book) => {
      const matchesQuery =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.category.toLowerCase().includes(q) ||
        book.isbn.toLowerCase().includes(q);
      const matchesCategory = category === 'All' || book.category === category;
      const matchesAvailability = availability === 'All' || book.status === availability;
      return matchesQuery && matchesCategory && matchesAvailability;
    });
  }, [books, query, category, availability]);

  const availableCount = books.filter((b) => b.status === 'Available').length;

  const handleResetFilters = () => {
    setQuery('');
    setCategory('All');
    setAvailability('All');
    if (onClearGlobalSearch) onClearGlobalSearch();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#172A3A] tracking-tight">
            Browse Library Catalog
          </h1>
          <p className="text-sm text-[#7B8794] mt-1">
            {books.length} curated volumes · {availableCount} currently available for borrowing
          </p>
        </div>

        {/* Grid / List View Switcher */}
        <div className="inline-flex items-center p-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs self-start">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#172A3A] text-white'
                : 'text-[#7B8794] hover:text-[#263442]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[#172A3A] text-white'
                : 'text-[#7B8794] hover:text-[#263442]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            List
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card-elevated rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#7B8794] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by book title, author, category, or ISBN..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm bg-[#F7F8FA]/60 focus:bg-white focus:outline-none focus:border-[#69B7B0] focus:ring-2 focus:ring-[#D9F0E9]/70 transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7B8794] hover:text-[#263442] cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Availability Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-[#7B8794] hidden sm:block" />
            <div className="inline-flex p-1 rounded-xl bg-[#F7F8FA] border border-slate-200/80">
              {['All', 'Available', 'Borrowed'].map((statusOpt) => (
                <button
                  key={statusOpt}
                  type="button"
                  onClick={() => setAvailability(statusOpt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    availability === statusOpt
                      ? 'bg-white text-[#172A3A] shadow-2xs border border-slate-200/70'
                      : 'text-[#7B8794] hover:text-[#263442]'
                  }`}
                >
                  {statusOpt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {BOOK_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                category === cat
                  ? 'bg-[#214C52] text-white shadow-2xs'
                  : 'bg-[#F7F8FA] text-[#263442] border border-slate-200/80 hover:border-[#69B7B0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-[#7B8794]">
        <span>
          Showing <strong className="text-[#172A3A]">{filteredBooks.length}</strong> of{' '}
          {books.length} books
        </span>
        {(query || category !== 'All' || availability !== 'All') && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[#214C52] font-medium hover:underline cursor-pointer"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Catalog Content */}
      {filteredBooks.length === 0 ? (
        <div className="card-elevated rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#D9F0E9]/70 text-[#214C52] mx-auto flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-[#172A3A]">No matching books found</h3>
          <p className="text-sm text-[#7B8794] mt-1 max-w-md mx-auto">
            Try adjusting your search keywords, switching categories, or clearing the availability filter.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-5 px-4 py-2 rounded-xl bg-[#172A3A] hover:bg-[#214C52] text-white text-xs font-semibold transition cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredBooks.map((book) => {
            const isAvailable = book.status === 'Available';
            return (
              <div
                key={book.id}
                onClick={() => onSelectBook(book.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectBook(book.id);
                  }
                }}
                className="card-elevated card-interactive rounded-2xl p-4 flex flex-col cursor-pointer group"
              >
                <BookCover book={book} size="md" />

                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-[#7B8794] truncate">
                    {book.category}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                      isAvailable
                        ? 'bg-[#D9F0E9] text-[#214C52]'
                        : 'bg-[#B9B5E8]/35 text-[#172A3A]'
                    }`}
                  >
                    {book.status}
                  </span>
                </div>

                <h3 className="mt-2 text-base font-semibold text-[#172A3A] leading-snug line-clamp-2 group-hover:text-[#214C52] transition">
                  {book.title}
                </h3>
                <p className="text-xs text-[#7B8794] mt-1 truncate">{book.author}</p>

                <div className="mt-auto pt-4 flex items-center justify-between text-xs border-t border-slate-100 mt-4">
                  <span className="font-mono text-[11px] text-[#7B8794]">{book.shelf}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#214C52] group-hover:translate-x-0.5 transition">
                    View Details
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-elevated rounded-2xl overflow-hidden divide-y divide-slate-100">
          {filteredBooks.map((book) => {
            const isAvailable = book.status === 'Available';
            return (
              <div
                key={book.id}
                onClick={() => onSelectBook(book.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectBook(book.id);
                  }
                }}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F7F8FA]/80 transition cursor-pointer group"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <BookCover book={book} size="sm" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-[#263442]">
                        {book.category}
                      </span>
                      <span className="text-[11px] font-mono text-[#7B8794]">
                        ISBN {book.isbn}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-[#172A3A] group-hover:text-[#214C52] transition">
                      {book.title}
                    </h3>
                    <p className="text-xs text-[#7B8794] mt-0.5">
                      {book.author} · {book.publisher} ({book.year})
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isAvailable
                        ? 'bg-[#D9F0E9] text-[#214C52]'
                        : 'bg-[#B9B5E8]/35 text-[#172A3A]'
                    }`}
                  >
                    {book.status}
                  </span>
                  <span className="text-xs font-semibold text-[#214C52] inline-flex items-center gap-1">
                    Open details
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
