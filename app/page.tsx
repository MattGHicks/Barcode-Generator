'use client';

import { useState } from 'react';

interface FormData {
  description: string;
  prefix: string;
  startNumber: string;
  count: string;
  pageWidth: string;
  pageHeight: string;
  scale: string;
  height: string;
  width: string;
  fontSize: string;
  fontFamily: string;
}

const FONT_OPTIONS = [
  { value: 'Helvetica-Bold', label: 'Helvetica Bold (Default)' },
  { value: 'Helvetica', label: 'Helvetica Regular' },
  { value: 'Times-Bold', label: 'Times Bold' },
  { value: 'Times-Roman', label: 'Times Roman' },
  { value: 'Courier-Bold', label: 'Courier Bold' },
  { value: 'Courier', label: 'Courier' },
];

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    description: '',
    prefix: '',
    startNumber: '1',
    count: '10',
    pageWidth: '1.5',
    pageHeight: '1.0',
    scale: '4',
    height: '0.6',
    width: '1.5',
    fontSize: '12',
    fontFamily: 'Helvetica-Bold',
  });

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReasoning, setAiReasoning] = useState('');
  const [error, setError] = useState('');
  const [uploadedCodes, setUploadedCodes] = useState<string[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showAllCodes, setShowAllCodes] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAiAssist = async () => {
    if (!formData.description.trim()) {
      setError('Please enter a description for AI assistance');
      return;
    }

    setAiLoading(true);
    setError('');
    setAiReasoning('');

    try {
      const response = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: formData.description }),
      });

      const config = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(config.error || 'AI assistance failed');
      }

      setFormData({
        ...formData,
        prefix: config.prefix || formData.prefix,
        startNumber: config.startNumber?.toString() || formData.startNumber,
        count: config.count?.toString() || formData.count,
        pageWidth: config.pageWidth?.toString() || formData.pageWidth,
        pageHeight: config.pageHeight?.toString() || formData.pageHeight,
      });

      setAiReasoning(config.reasoning || 'Settings updated by AI');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI assistance is unavailable right now.');
    } finally {
      setAiLoading(false);
    }
  };

  const processFile = async (file: File) => {
    setUploadLoading(true);
    setError('');
    setUploadedCodes([]);
    setUploadedFileName('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadedCodes(result.codes);
      setUploadedFileName(result.fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!validExtensions.includes(fileExtension)) {
      setError('Please upload a valid spreadsheet file (.xlsx, .xls, or .csv)');
      return;
    }

    await processFile(file);
  };

  const clearUploadedFile = () => {
    setUploadedCodes([]);
    setUploadedFileName('');
    setShowAllCodes(false);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const requestBody = uploadedCodes.length > 0
        ? { ...formData, codes: uploadedCodes }
        : formData;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      if (uploadedCodes.length > 0) {
        a.download = `barcodes_${uploadedCodes.length}_items.pdf`;
      } else {
        const prefixPart = formData.prefix ? `${formData.prefix}_` : '';
        a.download = `barcodes_${prefixPart}${formData.startNumber}.pdf`;
      }
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to generate barcodes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <style jsx global>{`
        input, textarea, select {
          color: #111827 !important;
          background-color: white !important;
        }
        input::placeholder, textarea::placeholder {
          color: #9ca3af !important;
        }
      `}</style>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Code39 Barcode Generator
          </h1>
          <p className="text-gray-600 mb-8">
            Generate professional Code39 barcodes with AI-powered configuration
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {aiReasoning && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">AI Suggestion:</p>
              <p className="text-blue-700">{aiReasoning}</p>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-6">
            {/* AI Assistance Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Smart Form Filling
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Describe what you need
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="e.g., 'I need 100 asset tags for inventory tracking' or '50 product labels starting from 5000'"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAiAssist}
                  disabled={aiLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {aiLoading ? 'AI is thinking...' : '✨ Fill Form with AI'}
                </button>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl border border-green-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Spreadsheet
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Upload an Excel (.xlsx, .xls) or CSV file with one column of numbers/codes.
              </p>
              <div className="space-y-3">
                {uploadedCodes.length === 0 ? (
                  <label
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      isDragging
                        ? 'border-green-500 bg-green-100'
                        : 'border-green-300 bg-white hover:bg-green-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploadLoading ? (
                        <p className="text-sm text-gray-500">Processing file...</p>
                      ) : isDragging ? (
                        <p className="text-sm text-green-600 font-medium">Drop file here</p>
                      ) : (
                        <>
                          <svg className="w-8 h-8 mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-400">.xlsx, .xls, .csv</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      disabled={uploadLoading}
                    />
                  </label>
                ) : (
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium text-gray-900">{uploadedFileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={clearUploadedFile}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">
                      {uploadedCodes.length} code{uploadedCodes.length !== 1 ? 's' : ''} found
                    </p>
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">Preview:</p>
                      <div className={`flex flex-wrap gap-1.5 overflow-y-auto ${showAllCodes ? 'max-h-48' : 'max-h-20'}`}>
                        {(showAllCodes ? uploadedCodes : uploadedCodes.slice(0, 20)).map((code, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-mono rounded border border-gray-200"
                          >
                            {String(code)}
                          </span>
                        ))}
                      </div>
                      {uploadedCodes.length > 20 && (
                        <button
                          type="button"
                          onClick={() => setShowAllCodes(!showAllCodes)}
                          className="mt-2 text-xs text-green-600 hover:text-green-800 font-medium"
                        >
                          {showAllCodes ? 'Show less' : `Show all ${uploadedCodes.length} codes`}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Code Pattern - Prefix always shown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prefix <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="prefix"
                  value={formData.prefix}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder={uploadedCodes.length > 0 ? "Add prefix to uploaded codes" : "e.g., 1001, ASSET, PROD (leave empty for just numbers)"}
                />
              </div>

              {/* Start Number and Quantity - hidden when file uploaded */}
              {uploadedCodes.length === 0 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Number
                    </label>
                    <input
                      type="number"
                      name="startNumber"
                      value={formData.startNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity (max 1000)
                    </label>
                    <input
                      type="number"
                      name="count"
                      value={formData.count}
                      onChange={handleInputChange}
                      min="1"
                      max="1000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {/* Page Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Width (inches)
                </label>
                <input
                  type="number"
                  name="pageWidth"
                  value={formData.pageWidth}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Height (inches)
                </label>
                <input
                  type="number"
                  name="pageHeight"
                  value={formData.pageHeight}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Advanced Settings (Collapsible) */}
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-medium text-gray-700 cursor-pointer">
                Advanced Settings
              </summary>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scale (1-5)
                  </label>
                  <input
                    type="number"
                    name="scale"
                    value={formData.scale}
                    onChange={handleInputChange}
                    min="1"
                    max="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bar Height (inches)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bar Width (inches)
                  </label>
                  <input
                    type="number"
                    name="width"
                    value={formData.width}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Size (pt)
                  </label>
                  <input
                    type="number"
                    name="fontSize"
                    value={formData.fontSize}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Style
                  </label>
                  <select
                    name="fontFamily"
                    value={formData.fontFamily}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </details>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {loading ? 'Generating...' : '📄 Generate & Download PDF'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Preview</h3>
            {uploadedCodes.length > 0 ? (
              <p className="text-sm text-gray-600">
                Will generate <span className="font-semibold">{uploadedCodes.length}</span> barcodes from uploaded file
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Will generate <span className="font-semibold">{formData.count}</span> barcodes
                from <span className="font-mono">{formData.prefix ? `${formData.prefix} ${formData.startNumber.padStart(4, '0')}` : formData.startNumber.padStart(4, '0')}</span> to{' '}
                <span className="font-mono">
                  {formData.prefix ? `${formData.prefix} ${(parseInt(formData.startNumber) + parseInt(formData.count) - 1).toString().padStart(4, '0')}` : (parseInt(formData.startNumber) + parseInt(formData.count) - 1).toString().padStart(4, '0')}
                </span>
              </p>
            )}
            <p className="text-sm text-gray-600 mt-1">
              Page size: {formData.pageWidth}" × {formData.pageHeight}"
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Font: {FONT_OPTIONS.find(f => f.value === formData.fontFamily)?.label}
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Built with Next.js, Tailwind CSS, and Claude AI</p>
          <p className="mt-1">by Matt Hicks <span className="text-red-500">❤️</span></p>
        </div>
      </div>
    </main>
  );
}
