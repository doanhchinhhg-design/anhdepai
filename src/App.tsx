import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  Sparkles, 
  User, 
  RefreshCcw, 
  Download, 
  Printer, 
  ChevronRight, 
  ChevronLeft,
  Sun,
  Contrast,
  Droplets,
  Zap,
  Thermometer,
  Layers,
  History,
  Check,
  X,
  Loader2,
  Maximize2,
  Split
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { processImage, EditMode, EditOptions } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [mode, setMode] = useState<EditMode>('id-photo');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBefore, setShowBefore] = useState(false);
  const [options, setOptions] = useState<EditOptions>({
    mode: 'id-photo',
    idSize: '3x4',
    idBackground: 'white',
    idClothing: 'none',
    adjustments: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      sharpness: 100,
      temperature: 100,
    }
  });

  const [clothingCategory, setClothingCategory] = useState<'nam' | 'nu' | 'somi' | 'hocsinh'>('nam');
  const [studioCategory, setStudioCategory] = useState<string>('auto-ai');

  const studioToneCategories = [
    {
      id: 'auto-ai',
      label: '1. TỰ ĐỘNG AI',
      presets: [
        { id: 'auto-studio', label: 'Studio tự động' },
        { id: 'auto-color', label: 'Tự động chỉnh màu' },
        { id: 'auto-beauty', label: 'Tự động làm đẹp' },
        { id: 'auto-light', label: 'Tự động ánh sáng' },
        { id: 'auto-sharp', label: 'Tự động tăng độ nét' },
        { id: 'auto-wb', label: 'Tự động cân bằng trắng' },
        { id: 'auto-face', label: 'Tự động chỉnh khuôn mặt' },
        { id: 'auto-skin', label: 'Tự động làm mịn da' },
        { id: 'auto-hdr', label: 'Tự động HDR' },
        { id: 'auto-resolution', label: 'Tự động tăng độ phân giải' },
      ]
    },
    {
      id: 'portrait',
      label: '2. CHÂN DUNG',
      presets: [
        { id: 'skin-smooth', label: 'Làm mịn da' },
        { id: 'remove-acne', label: 'Xóa mụn' },
        { id: 'brighten-eyes', label: 'Làm sáng mắt' },
        { id: 'whiten-teeth', label: 'Trắng răng' },
        { id: 'slim-face', label: 'Thon gọn khuôn mặt' },
        { id: 'brighten-face', label: 'Làm sáng khuôn mặt' },
        { id: 'pink-lips', label: 'Làm hồng môi' },
        { id: 'pink-cheeks', label: 'Làm hồng má' },
        { id: 'brighten-skin', label: 'Làm sáng da' },
        { id: 'ai-portrait-beauty', label: 'Làm đẹp chân dung AI' },
      ]
    },
    {
      id: 'photo-tone',
      label: '3. TÔNG MÀU ẢNH',
      presets: [
        { id: 'natural-tone', label: 'Tông tự nhiên' },
        { id: 'korean-tone', label: 'Tông Hàn Quốc' },
        { id: 'cinema-tone', label: 'Tông điện ảnh' },
        { id: 'vintage-tone', label: 'Tông vintage' },
        { id: 'fashion-tone', label: 'Tông thời trang' },
        { id: 'bright-studio-tone', label: 'Tông studio sáng' },
        { id: 'warm-tone', label: 'Tông ấm' },
        { id: 'cool-tone', label: 'Tông lạnh' },
        { id: 'classic-film-tone', label: 'Tông phim cổ điển' },
        { id: 'art-tone', label: 'Tông màu nghệ thuật' },
      ]
    },
    {
      id: 'lighting',
      label: '4. ÁNH SÁNG',
      presets: [
        { id: 'increase-brightness', label: 'Tăng độ sáng' },
        { id: 'decrease-brightness', label: 'Giảm độ sáng' },
        { id: 'increase-contrast', label: 'Tăng độ tương phản' },
        { id: 'adjust-highlights', label: 'Điều chỉnh vùng sáng' },
        { id: 'adjust-shadows', label: 'Điều chỉnh vùng tối' },
        { id: 'soft-light', label: 'Ánh sáng mềm' },
        { id: 'studio-light', label: 'Ánh sáng studio' },
        { id: 'portrait-light', label: 'Ánh sáng chân dung' },
        { id: 'cinema-light', label: 'Ánh sáng điện ảnh' },
        { id: 'hdr-light', label: 'Ánh sáng HDR' },
      ]
    },
    {
      id: 'quality-enhance',
      label: '5. NÂNG CAO CHẤT LƯỢNG',
      presets: [
        { id: 'increase-sharpness', label: 'Tăng độ sắc nét' },
        { id: 'upscale-hd', label: 'Nâng cấp ảnh HD' },
        { id: 'upscale-4k', label: 'Nâng cấp ảnh 4K' },
        { id: 'increase-resolution', label: 'Tăng độ phân giải' },
        { id: 'noise-reduction-studio', label: 'Giảm nhiễu ảnh' },
        { id: 'increase-details', label: 'Tăng chi tiết ảnh' },
        { id: 'clear-texture', label: 'Làm rõ kết cấu ảnh' },
        { id: 'sharpen-face', label: 'Làm nét khuôn mặt' },
        { id: 'increase-clarity', label: 'Tăng độ trong của ảnh' },
        { id: 'ai-quality-improve', label: 'Cải thiện chất lượng ảnh AI' },
      ]
    },
    {
      id: 'face-beauty',
      label: '6. LÀM ĐẸP KHUÔN MẶT',
      presets: [
        { id: 'advanced-skin-smooth', label: 'Làm mịn da nâng cao' },
        { id: 'whiten-skin', label: 'Làm trắng da' },
        { id: 'pink-skin', label: 'Làm hồng da' },
        { id: 'light-makeup', label: 'Trang điểm nhẹ' },
        { id: 'brighten-lips', label: 'Làm sáng môi' },
        { id: 'enlarge-eyes', label: 'Làm to mắt' },
        { id: 'slim-chin', label: 'Thu gọn cằm' },
        { id: 'nose-lift', label: 'Nâng sống mũi' },
        { id: 'soften-face', label: 'Làm mềm khuôn mặt' },
        { id: 'natural-beauty-studio', label: 'Làm đẹp tự nhiên' },
      ]
    },
    {
      id: 'old-photo-restoration',
      label: '7. PHỤC CHẾ ẢNH CŨ',
      presets: [
        { id: 'restore-old-photo', label: 'Phục chế ảnh cũ' },
        { id: 'sharpen-blurry-photo', label: 'Tăng độ nét ảnh mờ' },
        { id: 'recover-damaged-photo', label: 'Khôi phục ảnh bị hỏng' },
        { id: 'colorize-bw-photo', label: 'Tô màu ảnh đen trắng' },
        { id: 'fix-scratches', label: 'Sửa vết xước ảnh' },
        { id: 'recover-face-details', label: 'Khôi phục chi tiết khuôn mặt' },
        { id: 'upscale-old-photo', label: 'Tăng độ phân giải ảnh cũ' },
        { id: 'clarify-old-photo', label: 'Làm rõ ảnh cũ' },
        { id: 'recover-photo-colors', label: 'Phục hồi màu sắc ảnh' },
        { id: 'restore-vintage-photo', label: 'Phục chế ảnh cổ' },
      ]
    },
    {
      id: 'advanced-ai',
      label: '8. AI NÂNG CAO',
      presets: [
        { id: 'face-detection', label: 'Nhận diện khuôn mặt' },
        { id: 'face-alignment', label: 'Căn chỉnh khuôn mặt' },
        { id: 'background-blur', label: 'Làm mờ hậu cảnh (xóa phông)' },
        { id: 'ai-background-replace', label: 'Thay nền AI' },
        { id: 'composition-adjustment', label: 'Cân chỉnh bố cục ảnh' },
        { id: 'ai-portrait-light', label: 'Ánh sáng chân dung AI' },
        { id: 'subject-highlight', label: 'Làm nổi bật chủ thể' },
        { id: 'background-removal', label: 'Tách nền ảnh' },
        { id: 'ai-eye-sharpen', label: 'Làm nét mắt AI' },
        { id: 'auto-photo-effects', label: 'Tự động tạo hiệu ứng ảnh' },
      ]
    }
  ];

  const clothingOptions = {
    nam: [
      { id: 'm-suit-1', label: 'Vest đen + Sơ mi trắng + Cà vạt đen' },
      { id: 'm-suit-2', label: 'Vest đen + Sơ mi trắng + Cà vạt đỏ' },
      { id: 'm-suit-3', label: 'Vest xanh navy + Sơ mi trắng' },
      { id: 'm-suit-4', label: 'Vest xanh navy + Sơ mi xanh nhạt' },
      { id: 'm-suit-5', label: 'Vest xám đậm + Sơ mi trắng' },
      { id: 'm-suit-6', label: 'Vest xám đậm + Sơ mi xanh nhạt' },
      { id: 'm-suit-7', label: 'Vest xám sáng + Sơ mi trắng' },
      { id: 'm-suit-8', label: 'Vest xám sáng + Sơ mi hồng nhạt' },
      { id: 'm-suit-9', label: 'Vest đen slim fit + Sơ mi trắng' },
      { id: 'm-suit-10', label: 'Vest xanh đậm slim fit + Sơ mi trắng' },
      { id: 'm-suit-11', label: 'Vest doanh nhân 3 mảnh đen' },
      { id: 'm-suit-12', label: 'Vest doanh nhân 3 mảnh xanh navy' },
      { id: 'm-suit-13', label: 'Vest công sở trẻ trung xám' },
      { id: 'm-suit-14', label: 'Vest công sở trẻ trung xanh navy' },
      { id: 'm-suit-15', label: 'Vest cổ điển đen + Sơ mi trắng' },
      { id: 'm-suit-16', label: 'Vest công sở cao cấp xám đậm' },
      { id: 'm-suit-17', label: 'Vest lịch lãm xanh navy' },
      { id: 'm-suit-18', label: 'Vest lãnh đạo đen sang trọng' },
      { id: 'm-suit-19', label: 'Vest công sở trẻ trung xanh nhạt' },
      { id: 'm-suit-20', label: 'Vest phong cách Hàn Quốc đen' },
      { id: 'm-suit-tie-black', label: 'Vest đen + Cà vạt đen' },
      { id: 'm-suit-tie-blue', label: 'Vest đen + Cà vạt xanh' },
      { id: 'm-suit-tie-red', label: 'Vest đen + Cà vạt đỏ' },
      { id: 'm-suit-tie-checkered', label: 'Vest đen + Cà vạt đỏ caro' },
      { id: 'm-suit-navy-tie-black', label: 'Vest xanh navy + Cà vạt đen' },
      { id: 'm-suit-navy-tie-blue', label: 'Vest xanh navy + Cà vạt xanh' },
      { id: 'm-suit-navy-tie-red', label: 'Vest xanh navy + Cà vạt đỏ' },
      { id: 'm-suit-navy-tie-checkered', label: 'Vest xanh navy + Cà vạt đỏ caro' },
    ],
    nu: [
      { id: 'f-suit-1', label: 'Vest nữ đen + Sơ mi trắng' },
      { id: 'f-suit-2', label: 'Vest nữ xanh navy + Sơ mi trắng' },
      { id: 'f-suit-3', label: 'Vest nữ xám + Sơ mi trắng' },
      { id: 'f-suit-4', label: 'Vest nữ đen + Chân váy' },
      { id: 'f-suit-5', label: 'Vest nữ xanh navy + Chân váy' },
      { id: 'f-suit-6', label: 'Vest nữ xám + Chân váy' },
      { id: 'f-suit-7', label: 'Vest nữ công sở hồng nhạt' },
      { id: 'f-suit-8', label: 'Vest nữ công sở kem' },
      { id: 'f-suit-9', label: 'Vest nữ công sở xanh nhạt' },
      { id: 'f-suit-10', label: 'Vest nữ công sở thanh lịch đen' },
      { id: 'f-suit-11', label: 'Vest nữ lãnh đạo đen' },
      { id: 'f-suit-12', label: 'Vest nữ doanh nhân xanh navy' },
      { id: 'f-suit-13', label: 'Vest nữ slim fit xám' },
      { id: 'f-suit-14', label: 'Vest nữ phong cách Hàn Quốc' },
      { id: 'f-suit-15', label: 'Vest nữ công sở hiện đại' },
      { id: 'f-suit-16', label: 'Vest nữ blazer trắng' },
      { id: 'f-suit-17', label: 'Vest nữ blazer xám' },
      { id: 'f-suit-18', label: 'Vest nữ blazer xanh navy' },
      { id: 'f-suit-19', label: 'Vest nữ công sở sang trọng' },
      { id: 'f-suit-20', label: 'Vest nữ công sở trẻ trung' },
    ],
    somi: [
      { id: 's-shirt-1', label: 'Sơ mi trắng cổ bẻ nam' },
      { id: 's-shirt-2', label: 'Sơ mi trắng slim fit nam' },
      { id: 's-shirt-3', label: 'Sơ mi xanh nhạt công sở' },
      { id: 's-shirt-4', label: 'Sơ mi xám nhạt công sở' },
      { id: 's-shirt-5', label: 'Sơ mi đen công sở' },
      { id: 's-shirt-6', label: 'Sơ mi trắng cổ đứng' },
      { id: 's-shirt-7', label: 'Sơ mi trắng cổ nơ nữ' },
      { id: 's-shirt-8', label: 'Sơ mi trắng nữ công sở' },
      { id: 's-shirt-9', label: 'Sơ mi hồng nhạt nữ' },
      { id: 's-shirt-10', label: 'Sơ mi xanh nhạt nữ' },
      { id: 's-shirt-11', label: 'Sơ mi trắng cao cấp' },
      { id: 's-shirt-12', label: 'Sơ mi trắng công sở Hàn Quốc' },
      { id: 's-shirt-13', label: 'Sơ mi trắng cổ cài nút' },
      { id: 's-shirt-14', label: 'Sơ mi xanh da trời' },
      { id: 's-shirt-15', label: 'Sơ mi kem công sở' },
      { id: 's-shirt-16', label: 'Sơ mi sọc xanh nhạt' },
      { id: 's-shirt-17', label: 'Sơ mi trắng form rộng' },
      { id: 's-shirt-18', label: 'Sơ mi trắng cổ tròn' },
      { id: 's-shirt-19', label: 'Sơ mi lụa nữ công sở' },
      { id: 's-shirt-20', label: 'Sơ mi voan nữ công sở' },
    ],
    hocsinh: [
      { id: 'st-uni-1', label: 'Sơ mi trắng học sinh nam' },
      { id: 'st-uni-2', label: 'Sơ mi trắng học sinh nữ' },
      { id: 'st-uni-3', label: 'Đồng phục nam + Cà vạt đỏ' },
      { id: 'st-uni-4', label: 'Đồng phục nữ + Váy xanh' },
      { id: 'st-uni-5', label: 'Đồng phục trung học nam' },
      { id: 'st-uni-6', label: 'Đồng phục trung học nữ' },
      { id: 'st-uni-7', label: 'Đồng phục tiểu học nam' },
      { id: 'st-uni-8', label: 'Đồng phục tiểu học nữ' },
      { id: 'st-uni-9', label: 'Sơ mi trắng + Khăn quàng đỏ' },
      { id: 'st-uni-10', label: 'Đồng phục phong cách Hàn Quốc' },
      { id: 'st-uni-11', label: 'Đồng phục xanh navy' },
      { id: 'st-uni-12', label: 'Đồng phục vest xanh' },
      { id: 'st-uni-13', label: 'Đồng phục vest xám' },
      { id: 'st-uni-14', label: 'Đồng phục áo gile' },
      { id: 'st-uni-15', label: 'Đồng phục áo len' },
      { id: 'st-uni-16', label: 'Đồng phục áo vest' },
      { id: 'st-uni-17', label: 'Đồng phục váy caro' },
      { id: 'st-uni-18', label: 'Đồng phục quần tây xanh' },
      { id: 'st-uni-19', label: 'Sơ mi trắng tay ngắn' },
      { id: 'st-uni-20', label: 'Sơ mi trắng tay dài' },
    ]
  };

  const [exportFormat, setExportFormat] = useState<'png' | 'jpg'>('png');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [activeStudioTones, setActiveStudioTones] = useState<string[]>([]);

  const handleDownload = (format: 'png' | 'jpg') => {
    const link = document.createElement('a');
    const imageToDownload = editedImage || originalImage || '';
    link.href = imageToDownload;
    
    link.download = `lumina-edit-${Date.now()}.${format}`;
    link.click();
    setShowExportMenu(false);
  };

  const toggleStudioTone = (tone: string) => {
    setActiveStudioTones(prev => {
      const next = prev.includes(tone) ? prev.filter(t => t !== tone) : [...prev, tone];
      setOptions(opt => ({ ...opt, filters: next }));
      return next;
    });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result as string);
        setEditedImage(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  const handleProcess = async () => {
    if (!originalImage) return;
    setIsProcessing(true);
    try {
      const result = await processImage(originalImage, { ...options, mode });
      if (editedImage) {
        setHistory(prev => [...prev, editedImage]);
      }
      setEditedImage(result);
    } catch (error: any) {
      console.error("Processing error:", error);
      
      const isQuotaError = error?.message?.includes('RESOURCE_EXHAUSTED') || error?.code === 429;
      
      if (isQuotaError) {
        const useOwnKey = window.confirm(
          "Hệ thống đang quá tải hoặc hết hạn mức (Quota Exceeded).\n\n" +
          "Bạn có muốn sử dụng API Key cá nhân của mình để tiếp tục không?"
        );
        
        if (useOwnKey) {
          try {
            // @ts-ignore
            await window.aistudio.openSelectKey();
            // After selecting key, we can try again or just let user click process again
            alert("Đã cập nhật API Key. Vui lòng nhấn 'Bắt đầu xử lý' lại.");
          } catch (keyError) {
            console.error("Key selection error:", keyError);
          }
        }
      } else {
        alert("Có lỗi xảy ra khi xử lý ảnh. Vui lòng thử lại.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const newHistory = [...history];
    const lastImage = newHistory.pop();
    setHistory(newHistory);
    setEditedImage(lastImage || null);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Lumina <span className="text-emerald-500">Studio</span></h1>
        </div>
        
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
          {(['id-photo', 'studio'] as EditMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setOptions(prev => ({ ...prev, mode: m })); }}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                mode === m ? "bg-emerald-500 text-black shadow-lg" : "text-white/60 hover:text-white"
              )}
            >
              {m === 'id-photo' ? 'Ảnh Thẻ' : 'Studio'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {editedImage && history.length > 0 && (
            <button 
              onClick={handleUndo}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-all text-white/70 hover:text-white"
              title="Quay lại bước trước"
            >
              <History className="w-4 h-4" />
              Hoàn tác
            </button>
          )}
          
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={!editedImage && !originalImage}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Xuất File
            </button>
            
            <AnimatePresence>
              {showExportMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-40 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl z-[60] overflow-hidden"
                >
                  <button 
                    onClick={() => handleDownload('png')}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 flex items-center justify-between group"
                  >
                    <span>Định dạng PNG</span>
                    <span className="text-[10px] text-white/40 group-hover:text-emerald-500 transition-colors">Chất lượng cao</span>
                  </button>
                  <div className="h-px bg-white/5" />
                  <button 
                    onClick={() => handleDownload('jpg')}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 flex items-center justify-between group"
                  >
                    <span>Định dạng JPG</span>
                    <span className="text-[10px] text-white/40 group-hover:text-emerald-500 transition-colors">Dung lượng nhẹ</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar Controls */}
        <aside className="w-80 border-r border-white/5 bg-black/30 backdrop-blur-md overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-8">
            {/* Mode Specific Controls */}
            {mode === 'id-photo' && (
              <section className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 block">Kích Thước</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['2x3', '3x4', '4x6'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setOptions(prev => ({ ...prev, idSize: size }))}
                        className={cn(
                          "py-2 rounded-lg text-sm border transition-all",
                          options.idSize === size ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : "border-white/10 hover:border-white/20"
                        )}
                      >
                        {size} cm
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 block">Màu Nền</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[
                      { id: 'white', color: '#FFFFFF', label: 'Trắng' },
                      { id: 'blue', color: '#2563EB', label: 'Xanh' },
                      { id: 'lightblue', color: '#93C5FD', label: 'Xanh Nhạt' },
                      { id: 'red', color: '#DC2626', label: 'Đỏ' },
                      { id: 'grey', color: '#9CA3AF', label: 'Xám' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setOptions(prev => ({ ...prev, idBackground: item.id }))}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all shadow-inner",
                          options.idBackground === item.id ? "border-emerald-500 scale-110" : "border-white/10",
                        )}
                        style={{ backgroundColor: item.color }}
                        title={item.label}
                      />
                    ))}
                    <div className="relative group">
                      <input 
                        type="color" 
                        value={options.idBackground?.startsWith('#') ? options.idBackground : '#000000'}
                        onChange={(e) => setOptions(prev => ({ ...prev, idBackground: e.target.value }))}
                        className="w-8 h-8 rounded-full border-2 border-white/10 bg-transparent cursor-pointer overflow-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 block">Trang Phục</label>
                  
                  <div className="flex gap-1 bg-white/5 p-1 rounded-lg mb-4">
                    {[
                      { id: 'nam', label: 'Vest Nam' },
                      { id: 'nu', label: 'Vest Nữ' },
                      { id: 'somi', label: 'Sơ Mi' },
                      { id: 'hocsinh', label: 'Học Sinh' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setClothingCategory(cat.id as any)}
                        className={cn(
                          "flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                          clothingCategory === cat.id ? "bg-emerald-500 text-black shadow-lg" : "text-white/40 hover:text-white"
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative group/clothing">
                    <div className="w-full p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-all">
                      <span className="text-sm">
                        {options.idClothing === 'none' 
                          ? 'Giữ nguyên trang phục gốc' 
                          : [...clothingOptions.nam, ...clothingOptions.nu, ...clothingOptions.somi, ...clothingOptions.hocsinh].find(c => c.id === options.idClothing)?.label || 'Chọn trang phục'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/40 group-hover/clothing:rotate-90 transition-transform" />
                    </div>
                    
                    <div className="absolute left-0 right-0 mt-2 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl z-[60] opacity-0 invisible group-hover/clothing:opacity-100 group-hover/clothing:visible transition-all max-h-80 overflow-y-auto custom-scrollbar p-2 space-y-1">
                      <button
                        onClick={() => setOptions(prev => ({ ...prev, idClothing: 'none' }))}
                        className={cn(
                          "w-full px-4 py-2.5 rounded-lg text-xs text-left transition-all",
                          options.idClothing === 'none' ? "bg-emerald-500 text-black font-bold" : "hover:bg-white/5 text-white/70"
                        )}
                      >
                        Giữ nguyên trang phục gốc
                      </button>
                      <div className="h-px bg-white/5 my-1" />
                      {clothingOptions[clothingCategory].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setOptions(prev => ({ ...prev, idClothing: item.id }))}
                          className={cn(
                            "w-full px-4 py-2.5 rounded-lg text-xs text-left transition-all",
                            options.idClothing === item.id ? "bg-emerald-500 text-black font-bold" : "hover:bg-white/5 text-white/70"
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {mode === 'studio' && (
              <section className="space-y-6">
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider">
                    <Zap className="w-3 h-3" /> Tự động tối ưu AI
                  </div>
                  <p className="text-[10px] text-white/40 italic">AI tự động nhận diện cảnh, chỉnh màu, nâng cấp chân dung và ánh sáng studio.</p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 block">Tông Màu Nghệ Thuật</label>
                  
                  <div className="flex overflow-x-auto pb-2 mb-4 gap-1 custom-scrollbar">
                    {studioToneCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setStudioCategory(cat.id)}
                        className={cn(
                          "whitespace-nowAx px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex-shrink-0",
                          studioCategory === cat.id ? "bg-emerald-500 text-black shadow-lg" : "text-white/40 hover:text-white bg-white/5"
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {studioToneCategories.find(c => c.id === studioCategory)?.presets.map((tone) => (
                      <button
                        key={tone.id}
                        onClick={() => toggleStudioTone(tone.id)}
                        className={cn(
                          "px-3 py-3 rounded-lg text-[10px] font-bold border transition-all text-center flex flex-col items-center gap-2",
                          activeStudioTones.includes(tone.id) ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : "border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="w-full aspect-video bg-white/5 rounded overflow-hidden">
                           <img src={`https://picsum.photos/seed/${tone.id}/120/80`} className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
                        </div>
                        {tone.label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            <button
              onClick={handleProcess}
              disabled={!originalImage || isProcessing}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Chỉnh Sửa AI
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main Preview Area */}
        <section className="flex-1 bg-[#050505] relative flex flex-col items-center justify-center p-8">
          <AnimatePresence mode="wait">
            {!originalImage ? (
              <motion.div
                key="uploader"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                {...getRootProps()}
                className={cn(
                  "w-full max-w-2xl aspect-[4/3] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-6 transition-all cursor-pointer group",
                  isDragActive ? "border-emerald-500 bg-emerald-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
                )}
              >
                <input {...getInputProps()} />
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-10 h-10 text-white/40 group-hover:text-emerald-500 transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-medium mb-2">Kéo thả ảnh vào đây</p>
                  <p className="text-white/40 text-sm">Hỗ trợ JPG, PNG, WEBP (Tối đa 10MB)</p>
                </div>
                <button className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm">
                  Chọn Tệp
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full h-full flex items-center justify-center overflow-hidden"
              >
                <div 
                  className="relative max-w-full max-h-full shadow-2xl rounded-2xl overflow-auto border border-white/10 group bg-[#111] custom-scrollbar"
                  onWheel={handleWheel}
                >
                  <div 
                    className="transition-all duration-200 ease-out flex items-center justify-center min-w-full min-h-full"
                    style={{ 
                      width: `${zoomLevel * 100}%`,
                      padding: zoomLevel > 1 ? '2rem' : '0'
                    }}
                  >
                    <img
                      src={showBefore ? originalImage : (editedImage || originalImage)}
                      alt="Preview"
                      className="max-w-full h-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  {/* Zoom Controls Overlay - Fixed position relative to the scrollable container's parent or using sticky */}
                  <div className="sticky bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 z-10 opacity-0 group-hover:opacity-100 transition-opacity mb-4 w-fit">
                    <button onClick={handleZoomOut} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Thu nhỏ">
                      <X className="w-4 h-4 rotate-45" />
                    </button>
                    <button onClick={handleResetZoom} className="px-2 py-1 text-[10px] font-bold hover:bg-white/10 rounded-lg transition-colors min-w-[3rem]">
                      {Math.round(zoomLevel * 100)}%
                    </button>
                    <button onClick={handleZoomIn} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Phóng to">
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Before/After Overlay */}
                  {editedImage && (
                    <div className="absolute top-4 left-4 flex gap-2">
                      <button
                        onMouseDown={() => setShowBefore(true)}
                        onMouseUp={() => setShowBefore(false)}
                        onMouseLeave={() => setShowBefore(false)}
                        className="px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-bold border border-white/10 hover:bg-black/70 transition-all flex items-center gap-2"
                      >
                        <Split className="w-3 h-3" />
                        Giữ để xem ảnh Gốc
                      </button>
                    </div>
                  )}

                  {/* Processing Overlay */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-center items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="relative">
                          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
                          <Sparkles className="w-6 h-6 text-emerald-400 absolute top-0 right-0 animate-pulse" />
                        </div>
                        <p className="text-emerald-500 font-bold tracking-widest uppercase text-xs">AI đang xử lý...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Bar - Moved below image */}
                <div className="mt-8 flex items-center gap-4 bg-black/50 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 shadow-2xl">
                   <button 
                    onClick={() => { setOriginalImage(null); setEditedImage(null); }}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all flex items-center gap-2 text-xs font-medium"
                    title="Xoá Ảnh"
                   >
                     <X className="w-4 h-4" />
                     Xoá Ảnh
                   </button>
                   <div className="w-px h-6 bg-white/10" />
                   <button 
                    onClick={() => setOriginalImage(null)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg text-sm font-medium transition-all"
                   >
                     <RefreshCcw className="w-4 h-4" />
                     Ảnh Mới
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
