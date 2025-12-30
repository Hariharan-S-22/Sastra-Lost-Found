
import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Item, ItemType, ItemStatus } from '../types';
import { CATEGORIES } from '../constants';
import { generateItemDescription, categorizeItem, generateCategoryDoodle } from '../services/geminiService';

// Fallback doodles if AI generation fails
const FALLBACK_DOODLES: Record<string, string> = {
  'Electronics': 'https://raw.githubusercontent.com/google/material-design-icons/master/png/hardware/computer/materialicons/48dp/2x/baseline_computer_black_48dp.png',
  'Books': 'https://raw.githubusercontent.com/google/material-design-icons/master/png/action/book/materialicons/48dp/2x/baseline_book_black_48dp.png',
  'IDs': 'https://raw.githubusercontent.com/google/material-design-icons/master/png/action/assignment_ind/materialicons/48dp/2x/baseline_assignment_ind_black_48dp.png',
  'Keys': 'https://raw.githubusercontent.com/google/material-design-icons/master/png/communication/vpn_key/materialicons/48dp/2x/baseline_vpn_key_black_48dp.png',
  'Bags': 'https://raw.githubusercontent.com/google/material-design-icons/master/png/action/shopping_bag/materialicons/48dp/2x/baseline_shopping_bag_black_48dp.png',
  'Others': 'https://raw.githubusercontent.com/google/material-design-icons/master/png/action/help_outline/materialicons/48dp/2x/baseline_help_outline_black_48dp.png'
};

interface ItemFormProps {
  user: User;
  onAdd: (item: Item) => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ user, onAdd }) => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemType = type?.toUpperCase() === 'LOST' ? ItemType.LOST : ItemType.FOUND;

  const [formData, setFormData] = useState({
    title: '',
    category: 'Others',
    location: '',
    description: '',
  });
  
  const [images, setImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTitleBlur = () => {
    setFormData(prev => ({
      ...prev,
      title: prev.title.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAICompose = async () => {
    if (!formData.title || formData.title.length < 5) {
      alert("Please provide a more descriptive title first.");
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await generateItemDescription(formData.title + " " + formData.description);
      const category = await categorizeItem(formData.title, generated);
      
      setFormData(prev => ({ 
        ...prev, 
        description: generated,
        category: CATEGORIES.includes(category) ? category : prev.category
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0 && itemType === ItemType.FOUND) {
      alert("Found items must have a photo for verification.");
      return;
    }
    
    setIsSubmitting(true);

    let finalImages = [...images];
    
    // If LOST and no images, generate a black & white doodle
    if (finalImages.length === 0 && itemType === ItemType.LOST) {
      const doodle = await generateCategoryDoodle(formData.category);
      if (doodle) {
        finalImages = [doodle];
      } else {
        finalImages = [FALLBACK_DOODLES[formData.category] || FALLBACK_DOODLES['Others']];
      }
    }

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

    const newItem: Item = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      category: formData.category,
      type: itemType,
      description: formData.description,
      location: formData.location || 'Unknown Location',
      imagePaths: finalImages,
      reporterId: user.id,
      reporterName: user.name,
      date: formattedDate,
      status: ItemStatus.NEW,
      messages: []
    };

    onAdd(newItem);
    setIsSubmitting(false);
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className={`p-10 ${itemType === ItemType.LOST ? 'bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20' : 'bg-green-50 dark:bg-green-900/10 border-b border-green-100 dark:border-green-900/20'}`}>
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl shadow-lg ${itemType === ItemType.LOST ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
              <i className={itemType === ItemType.LOST ? 'fas fa-search-plus' : 'fas fa-bullhorn'}></i>
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-tight">Report {itemType} Item</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-[0.2em] opacity-70">Registry Intake Protocol</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-1">Case Headline</label>
              <input
                type="text"
                required
                placeholder="e.g. Black Casio Watch"
                className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-blue-500 outline-none transition text-slate-900 dark:text-white font-bold"
                value={formData.title}
                onBlur={handleTitleBlur}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-1">Category</label>
              <select
                className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-blue-500 outline-none transition text-slate-900 dark:text-white font-bold appearance-none cursor-pointer"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-1">Found At/Last Seen At</label>
              <input
                type="text"
                required
                placeholder="e.g. SOC AUDI"
                className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-blue-500 outline-none transition text-slate-900 dark:text-white font-bold"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3 px-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Description</label>
              <button
                type="button"
                onClick={handleAICompose}
                disabled={isGenerating}
                className="text-[9px] font-black text-blue-600 dark:text-blue-400 flex items-center gap-2 disabled:opacity-50 transition uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800"
              >
                {isGenerating ? <i className="fas fa-sparkles animate-pulse"></i> : <i className="fas fa-magic"></i>}
                {isGenerating ? 'Synthesizing...' : 'Gemini AI Polish'}
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="Detail specific markers, stickers, or distinguishing damage..."
              className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-3xl focus:border-blue-500 outline-none resize-none transition text-slate-900 dark:text-white font-medium"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 px-1">Visual Log</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-700 group shadow-lg">
                  <img src={img} className="w-full h-full object-cover" alt="Log" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><i className="fas fa-trash-alt"></i></button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square bg-slate-50 dark:bg-slate-900 rounded-2xl border-4 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 transition-all group"
              >
                <i className="fas fa-camera text-2xl mb-2 text-blue-500"></i>
                <span className="text-[9px] font-black uppercase tracking-widest">Attach Photo</span>
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" multiple className="hidden" />
            
            {itemType === ItemType.LOST && images.length === 0 && (
              <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 mt-4">
                 <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
                   <i className="fas fa-palette"></i>
                 </div>
                 <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                   No photo attached.
                 </p>
              </div>
            )}
          </div>

          <div className="flex gap-6 pt-6">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 px-8 py-5 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-[10px] hover:bg-slate-50 dark:hover:bg-slate-900 transition"
            >
              Abort
            </button>
            <button
              disabled={isSubmitting}
              type="submit"
              className={`flex-[2] px-8 py-5 rounded-2xl font-black text-white uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 ${itemType === ItemType.LOST ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isSubmitting ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-upload"></i>}
              {isSubmitting ? (images.length === 0 && itemType === ItemType.LOST ? 'Drawing Doodle...' : 'Dispatching...') : 'Finalize Registry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemForm;
