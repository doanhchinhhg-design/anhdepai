import { GoogleGenAI } from "@google/genai";

export type EditMode = 'id-photo' | 'studio';

export interface EditOptions {
  mode: EditMode;
  // ID Photo specific
  idSize?: '2x3' | '3x4' | '4x6';
  idBackground?: string; // Hex or color name
  idClothing?: string;
  // Studio specific
  filters?: string[];
  adjustments?: {
    brightness: number;
    contrast: number;
    saturation: number;
    sharpness: number;
    temperature: number;
  };
  // Restoration specific
  restoreType?: 'denoise' | 'scratch' | 'colorize' | 'upscale';
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function processImage(base64Image: string, options: EditOptions): Promise<string> {
  let prompt = "";
  
  // ... (rest of prompt logic remains same)
  if (options.mode === 'id-photo') {
    prompt = `Hãy đóng vai một biên tập viên phòng chụp ảnh chuyên nghiệp. Chuyển ảnh này thành ảnh thẻ chuyên nghiệp.
    - Phát hiện khuôn mặt và cắt ảnh phù hợp cho ảnh thẻ.
    - Nâng cao chất lượng ảnh lên ultra HD.
    - Áp dụng làm đẹp tự nhiên: làm mịn da, làm sáng mắt.
    - Điều chỉnh ánh sáng và độ sắc nét để có cái nhìn chuyên nghiệp.`;

    if (options.idClothing && options.idClothing !== 'none') {
      const clothingMap: Record<string, string> = {
        // Vest Nam
        'm-suit-1': 'bộ vest đen, sơ mi trắng, cà vạt đen lịch lãm',
        'm-suit-2': 'bộ vest đen, sơ mi trắng, cà vạt đỏ nổi bật',
        'm-suit-3': 'bộ vest xanh navy, sơ mi trắng chuyên nghiệp',
        'm-suit-4': 'bộ vest xanh navy, sơ mi xanh nhạt nhẹ nhàng',
        'm-suit-5': 'bộ vest xám đậm, sơ mi trắng trang trọng',
        'm-suit-6': 'bộ vest xám đậm, sơ mi xanh nhạt hiện đại',
        'm-suit-7': 'bộ vest xám sáng, sơ mi trắng trẻ trung',
        'm-suit-8': 'bộ vest xám sáng, sơ mi hồng nhạt tinh tế',
        'm-suit-9': 'bộ vest đen slim fit, sơ mi trắng ôm dáng',
        'm-suit-10': 'bộ vest xanh đậm slim fit, sơ mi trắng hiện đại',
        'm-suit-11': 'bộ vest doanh nhân 3 mảnh màu đen sang trọng',
        'm-suit-12': 'bộ vest doanh nhân 3 mảnh màu xanh navy quyền lực',
        'm-suit-13': 'bộ vest công sở trẻ trung màu xám',
        'm-suit-14': 'bộ vest công sở trẻ trung màu xanh navy',
        'm-suit-15': 'bộ vest cổ điển đen, sơ mi trắng truyền thống',
        'm-suit-16': 'bộ vest công sở cao cấp màu xám đậm',
        'm-suit-17': 'bộ vest lịch lãm màu xanh navy',
        'm-suit-18': 'bộ vest lãnh đạo màu đen sang trọng bậc nhất',
        'm-suit-19': 'bộ vest công sở trẻ trung màu xanh nhạt',
        'm-suit-20': 'bộ vest phong cách Hàn Quốc màu đen thời thượng',
        'm-suit-tie-black': 'bộ vest đen sang trọng kết hợp cà vạt đen',
        'm-suit-tie-blue': 'bộ vest đen lịch lãm kết hợp cà vạt xanh dương',
        'm-suit-tie-red': 'bộ vest đen chuyên nghiệp kết hợp cà vạt đỏ',
        'm-suit-tie-checkered': 'bộ vest đen hiện đại kết hợp cà vạt đỏ caro',
        'm-suit-navy-tie-black': 'bộ vest xanh navy kết hợp cà vạt đen',
        'm-suit-navy-tie-blue': 'bộ vest xanh navy kết hợp cà vạt xanh cùng tông',
        'm-suit-navy-tie-red': 'bộ vest xanh navy kết hợp cà vạt đỏ quyền lực',
        'm-suit-navy-tie-checkered': 'bộ vest xanh navy kết hợp cà vạt đỏ caro nổi bật',
        
        // Vest Nữ
        'f-suit-1': 'bộ vest nữ đen, sơ mi trắng thanh lịch',
        'f-suit-2': 'bộ vest nữ xanh navy, sơ mi trắng chuyên nghiệp',
        'f-suit-3': 'bộ vest nữ xám, sơ mi trắng hiện đại',
        'f-suit-4': 'bộ vest nữ đen kết hợp chân váy công sở',
        'f-suit-5': 'bộ vest nữ xanh navy kết hợp chân váy',
        'f-suit-6': 'bộ vest nữ xám kết hợp chân váy',
        'f-suit-7': 'bộ vest nữ công sở màu hồng nhạt nữ tính',
        'f-suit-8': 'bộ vest nữ công sở màu kem nhã nhặn',
        'f-suit-9': 'bộ vest nữ công sở màu xanh nhạt trẻ trung',
        'f-suit-10': 'bộ vest nữ công sở thanh lịch màu đen',
        'f-suit-11': 'bộ vest nữ lãnh đạo màu đen quyền lực',
        'f-suit-12': 'bộ vest nữ doanh nhân màu xanh navy sang trọng',
        'f-suit-13': 'bộ vest nữ slim fit màu xám tôn dáng',
        'f-suit-14': 'bộ vest nữ phong cách Hàn Quốc thời trang',
        'f-suit-15': 'bộ vest nữ công sở hiện đại',
        'f-suit-16': 'bộ blazer nữ màu trắng tinh khôi',
        'f-suit-17': 'bộ blazer nữ màu xám thời thượng',
        'f-suit-18': 'bộ blazer nữ màu xanh navy năng động',
        'f-suit-19': 'bộ vest nữ công sở sang trọng cao cấp',
        'f-suit-20': 'bộ vest nữ công sở trẻ trung năng động',
        
        // Sơ mi
        's-shirt-1': 'áo sơ mi trắng cổ bẻ nam truyền thống',
        's-shirt-2': 'áo sơ mi trắng slim fit nam hiện đại',
        's-shirt-3': 'áo sơ mi xanh nhạt công sở thanh lịch',
        's-shirt-4': 'áo sơ mi xám nhạt công sở nhã nhặn',
        's-shirt-5': 'áo sơ mi đen công sở cá tính',
        's-shirt-6': 'áo sơ mi trắng cổ đứng nam tính',
        's-shirt-7': 'áo sơ mi trắng cổ nơ nữ điệu đà',
        's-shirt-8': 'áo sơ mi trắng nữ công sở cơ bản',
        's-shirt-9': 'áo sơ mi hồng nhạt nữ nhẹ nhàng',
        's-shirt-10': 'áo sơ mi xanh nhạt nữ thanh thoát',
        's-shirt-11': 'áo sơ mi trắng cao cấp chất liệu đẹp',
        's-shirt-12': 'áo sơ mi trắng công sở phong cách Hàn Quốc',
        's-shirt-13': 'áo sơ mi trắng cổ cài nút chỉn chu',
        's-shirt-14': 'áo sơ mi màu xanh da trời tươi sáng',
        's-shirt-15': 'áo sơ mi màu kem công sở thanh lịch',
        's-shirt-16': 'áo sơ mi sọc xanh nhạt tinh tế',
        's-shirt-17': 'áo sơ mi trắng form rộng thoải mái',
        's-shirt-18': 'áo sơ mi trắng cổ tròn nữ tính',
        's-shirt-19': 'áo sơ mi lụa nữ công sở sang trọng',
        's-shirt-20': 'áo sơ mi voan nữ công sở nhẹ nhàng',
        
        // Học sinh
        'st-uni-1': 'áo sơ mi trắng học sinh nam gọn gàng',
        'st-uni-2': 'áo sơ mi trắng học sinh nữ thanh tú',
        'st-uni-3': 'đồng phục học sinh nam kèm cà vạt đỏ',
        'st-uni-4': 'đồng phục học sinh nữ kèm váy xanh',
        'st-uni-5': 'đồng phục học sinh trung học nam chỉn chu',
        'st-uni-6': 'đồng phục học sinh trung học nữ duyên dáng',
        'st-uni-7': 'đồng phục học sinh tiểu học nam đáng yêu',
        'st-uni-8': 'đồng phục học sinh tiểu học nữ dễ thương',
        'st-uni-9': 'áo sơ mi trắng học sinh kèm khăn quàng đỏ',
        'st-uni-10': 'đồng phục học sinh phong cách Hàn Quốc thời thượng',
        'st-uni-11': 'đồng phục học sinh màu xanh navy năng động',
        'st-uni-12': 'đồng phục học sinh áo vest xanh trang trọng',
        'st-uni-13': 'đồng phục học sinh áo vest xám hiện đại',
        'st-uni-14': 'đồng phục học sinh kèm áo gile len',
        'st-uni-15': 'đồng phục học sinh áo len ấm áp',
        'st-uni-16': 'đồng phục học sinh bộ vest học đường',
        'st-uni-17': 'đồng phục học sinh váy caro nữ tính',
        'st-uni-18': 'đồng phục học sinh quần tây xanh nam tính',
        'st-uni-19': 'áo sơ mi trắng học sinh tay ngắn năng động',
        'st-uni-20': 'áo sơ mi trắng học sinh tay dài lịch sự'
      };
      prompt += `\n- Thay thế trang phục của người trong ảnh bằng ${clothingMap[options.idClothing] || options.idClothing} trông thật thực tế và vừa vặn.`;
    }

    if (options.idBackground) {
      prompt += `\n- Thay thế nền bằng màu ${options.idBackground} trơn. Đảm bảo tách nền cực kỳ chính xác, không lem vào tóc hay quần áo.`;
    }
  } else if (options.mode === 'studio') {
    prompt = `Hãy đóng vai một chuyên gia chỉnh sửa ảnh Studio chuyên nghiệp. Nâng cao bức ảnh này với các tiêu chuẩn cao cấp nhất:
    
    1. Tự động chỉnh màu (Auto Color Correction):
    - Phân tích hình ảnh, điều chỉnh cân bằng trắng, phơi sáng và cân bằng vùng sáng/tối.
    - Cải thiện độ chính xác và độ rực rỡ của màu sắc.

    2. Nâng cấp chân dung chuyên nghiệp:
    - Làm mịn da tự nhiên, giữ lại kết cấu da chân thực.
    - Làm sáng mắt, xóa mụn và các khuyết điểm nhỏ.
    - Tối ưu hóa ánh sáng và độ sắc nét trên khuôn mặt.

    3. Hiệu ứng ánh sáng Studio:
    - Mô phỏng ánh sáng mềm (soft light) của studio chuyên nghiệp.
    - Tăng chiều sâu và độ tương phản nghệ thuật.

    4. Nâng cao chất lượng:
    - Giảm nhiễu, tăng độ sắc nét và cải thiện chi tiết ảnh lên mức tối đa.
    
    5. Nhận diện cảnh thông minh:
    - Tự động nhận diện nếu đây là ảnh chân dung, ảnh thẻ, ngoài trời, trong nhà hoặc ảnh cũ để áp dụng thuật toán tối ưu nhất.`;
    
    if (options.filters && options.filters.length > 0) {
      const toneMap: Record<string, string> = {
        // 1. TỰ ĐỘNG AI
        'auto-studio': 'Studio tự động: Tự động tối ưu hóa toàn bộ bức ảnh theo tiêu chuẩn studio chuyên nghiệp.',
        'auto-color': 'Tự động chỉnh màu: Tự động cân bằng màu sắc, độ rực rỡ và tông màu.',
        'auto-beauty': 'Tự động làm đẹp: Tự động nhận diện và làm đẹp khuôn mặt, làn da.',
        'auto-light': 'Tự động ánh sáng: Tự động điều chỉnh độ sáng, độ tương phản và phơi sáng.',
        'auto-sharp': 'Tự động tăng độ nét: Tự động làm rõ các chi tiết mờ nhạt.',
        'auto-wb': 'Tự động cân bằng trắng: Tự động điều chỉnh nhiệt độ màu chính xác.',
        'auto-face': 'Tự động chỉnh khuôn mặt: Tự động tối ưu hóa các đường nét khuôn mặt.',
        'auto-skin': 'Tự động làm mịn da: Tự động làm mờ khuyết điểm da một cách tự nhiên.',
        'auto-hdr': 'Tự động HDR: Tự động mở rộng dải động, làm rõ vùng sáng và vùng tối.',
        'auto-resolution': 'Tự động tăng độ phân giải: Tự động nâng cấp chất lượng điểm ảnh.',

        // 2. CHÂN DUNG (PORTRAIT)
        'skin-smooth': 'Làm mịn da: Làm da mịn màng, giữ lại lỗ chân lông tự nhiên.',
        'remove-acne': 'Xóa mụn: Loại bỏ mụn, vết thâm và các khuyết điểm nhỏ trên da.',
        'brighten-eyes': 'Làm sáng mắt: Tăng độ trong và độ sáng cho đôi mắt.',
        'whiten-teeth': 'Trắng răng: Làm trắng răng một cách tự nhiên.',
        'slim-face': 'Thon gọn khuôn mặt: Điều chỉnh đường nét khuôn mặt thon gọn hơn.',
        'brighten-face': 'Làm sáng khuôn mặt: Tập trung ánh sáng vào vùng khuôn mặt.',
        'pink-lips': 'Làm hồng môi: Thêm sắc hồng tự nhiên cho đôi môi.',
        'pink-cheeks': 'Làm hồng má: Thêm chút phấn hồng nhẹ nhàng cho gò má.',
        'brighten-skin': 'Làm sáng da: Nâng tông da sáng hồng rạng rỡ.',
        'ai-portrait-beauty': 'Làm đẹp chân dung AI: Sử dụng AI để làm đẹp tổng thể chân dung.',

        // 3. TÔNG MÀU ẢNH
        'natural-tone': 'Tông tự nhiên: Giữ màu sắc trung thực, trong trẻo.',
        'korean-tone': 'Tông Hàn Quốc: Màu sắc nhẹ nhàng, hơi sáng và trong veo kiểu Hàn.',
        'cinema-tone': 'Tông điện ảnh: Màu sắc đậm đà, độ tương phản cao kiểu phim chiếu rạp.',
        'vintage-tone': 'Tông vintage: Màu sắc hoài cổ, hơi ngả vàng hoặc nâu nhẹ.',
        'fashion-tone': 'Tông thời trang: Màu sắc hiện đại, rực rỡ và sắc nét.',
        'bright-studio-tone': 'Tông studio sáng: Ánh sáng trắng trong, sạch sẽ.',
        'warm-tone': 'Tông ấm: Tăng sắc vàng, cam tạo cảm giác ấm áp.',
        'cool-tone': 'Tông lạnh: Tăng sắc xanh tạo cảm giác mát mẻ, hiện đại.',
        'classic-film-tone': 'Tông phim cổ điển: Mô phỏng màu sắc của các loại phim máy ảnh cũ.',
        'art-tone': 'Tông màu nghệ thuật: Màu sắc phá cách, mang tính sáng tạo cao.',

        // 4. ÁNH SÁNG
        'increase-brightness': 'Tăng độ sáng: Làm bức ảnh sáng hơn tổng thể.',
        'decrease-brightness': 'Giảm độ sáng: Làm bức ảnh tối hơn, sâu hơn.',
        'increase-contrast': 'Tăng độ tương phản: Làm rõ sự khác biệt giữa vùng sáng và tối.',
        'adjust-highlights': 'Điều chỉnh vùng sáng: Làm dịu hoặc tăng cường các vùng quá sáng.',
        'adjust-shadows': 'Điều chỉnh vùng tối: Làm rõ chi tiết trong các vùng tối.',
        'soft-light': 'Ánh sáng mềm: Tạo hiệu ứng ánh sáng dịu nhẹ, không gắt.',
        'studio-light': 'Ánh sáng studio: Mô phỏng hệ thống đèn studio chuyên nghiệp.',
        'portrait-light': 'Ánh sáng chân dung: Ánh sáng tập trung tôn vinh chủ thể người.',
        'cinema-light': 'Ánh sáng điện ảnh: Ánh sáng có tính kịch tính và chiều sâu.',
        'hdr-light': 'Ánh sáng HDR: Cân bằng ánh sáng hoàn hảo trên toàn bộ khung hình.',

        // 5. NÂNG CAO CHẤT LƯỢNG
        'increase-sharpness': 'Tăng độ sắc nét: Làm các đường viền và chi tiết rõ ràng hơn.',
        'upscale-hd': 'Nâng cấp ảnh HD: Tăng độ phân giải lên chuẩn High Definition.',
        'upscale-4k': 'Nâng cấp ảnh 4K: Tăng độ phân giải lên chuẩn Ultra HD 4K.',
        'increase-resolution': 'Tăng độ phân giải: Cải thiện mật độ điểm ảnh.',
        'noise-reduction-studio': 'Giảm nhiễu ảnh: Loại bỏ các hạt nhiễu, hạt cát trong ảnh.',
        'increase-details': 'Tăng chi tiết ảnh: Làm nổi bật các chi tiết nhỏ nhất.',
        'clear-texture': 'Làm rõ kết cấu ảnh: Tăng cường độ chi tiết bề mặt vật liệu.',
        'sharpen-face': 'Làm nét khuôn mặt: Tập trung làm rõ các đường nét trên mặt.',
        'increase-clarity': 'Tăng độ trong của ảnh: Loại bỏ lớp sương mờ, làm ảnh trong veo.',
        'ai-quality-improve': 'Cải thiện chất lượng ảnh AI: Dùng AI nâng cấp chất lượng tổng thể.',

        // 6. LÀM ĐẸP KHUÔN MẶT
        'advanced-skin-smooth': 'Làm mịn da nâng cao: Xử lý da chuyên sâu, hoàn hảo.',
        'whiten-skin': 'Làm trắng da: Làm da trắng sáng một cách tự nhiên.',
        'pink-skin': 'Làm hồng da: Tạo sắc da hồng hào khỏe mạnh.',
        'light-makeup': 'Trang điểm nhẹ: Thêm lớp makeup mỏng nhẹ tự nhiên.',
        'brighten-lips': 'Làm sáng môi: Làm môi tươi tắn và rõ nét hơn.',
        'enlarge-eyes': 'Làm to mắt: Điều chỉnh kích thước mắt to tròn hơn.',
        'slim-chin': 'Thu gọn cằm: Tạo cằm V-line thanh tú.',
        'nose-lift': 'Nâng sống mũi: Làm sống mũi cao và thon gọn hơn.',
        'soften-face': 'Làm mềm khuôn mặt: Làm các đường nét bớt góc cạnh.',
        'natural-beauty-studio': 'Làm đẹp tự nhiên: Tôn vinh vẻ đẹp sẵn có một cách tinh tế.',

        // 7. PHỤC CHẾ ẢNH CŨ
        'restore-old-photo': 'Phục chế ảnh cũ: Khôi phục tổng thể ảnh bị xuống cấp theo thời gian.',
        'sharpen-blurry-photo': 'Tăng độ nét ảnh mờ: Làm rõ các bức ảnh bị rung tay hoặc out nét.',
        'recover-damaged-photo': 'Khôi phục ảnh bị hỏng: Vá các vùng ảnh bị rách, mất chi tiết.',
        'colorize-bw-photo': 'Tô màu ảnh đen trắng: Thêm màu sắc sống động cho ảnh đơn sắc.',
        'fix-scratches': 'Sửa vết xước ảnh: Loại bỏ các đường kẻ, vết xước trên bề mặt ảnh.',
        'recover-face-details': 'Khôi phục chi tiết khuôn mặt: Tái tạo lại khuôn mặt từ ảnh mờ.',
        'upscale-old-photo': 'Tăng độ phân giải ảnh cũ: Nâng cấp chất lượng ảnh xưa.',
        'clarify-old-photo': 'Làm rõ ảnh cũ: Loại bỏ lớp ố vàng, mờ đục của thời gian.',
        'recover-photo-colors': 'Phục hồi màu sắc ảnh: Làm tươi lại những màu sắc đã phai.',
        'restore-vintage-photo': 'Phục chế ảnh cổ: Giữ hồn ảnh xưa nhưng với chất lượng mới.',

        // 8. AI NÂNG CAO
        'face-detection': 'Nhận diện khuôn mặt: AI tự động xác định vị trí các khuôn mặt.',
        'face-alignment': 'Căn chỉnh khuôn mặt: Điều chỉnh góc nhìn khuôn mặt thẳng và cân đối.',
        'background-blur': 'Làm mờ hậu cảnh (xóa phông): Tạo hiệu ứng xóa phông như máy ảnh chuyên nghiệp.',
        'ai-background-replace': 'Thay nền AI: Tự động tách người và thay thế bối cảnh mới.',
        'composition-adjustment': 'Cân chỉnh bố cục ảnh: Tự động cắt cúp theo tỷ lệ vàng.',
        'ai-portrait-light': 'Ánh sáng chân dung AI: Điều chỉnh hướng sáng thông minh trên mặt.',
        'subject-highlight': 'Làm nổi bật chủ thể: Làm chủ thể sáng và rõ hơn hậu cảnh.',
        'background-removal': 'Tách nền ảnh: Tách chủ thể ra khỏi nền với độ chính xác cao.',
        'ai-eye-sharpen': 'Làm nét mắt AI: Tập trung làm đôi mắt sắc sảo và có hồn.',
        'auto-photo-effects': 'Tự động tạo hiệu ứng ảnh: AI tự đề xuất hiệu ứng phù hợp nhất.'
      };
      const selectedTones = options.filters.map(f => toneMap[f] || f).join(', ');
      prompt += `\n- Áp dụng phong cách màu nghệ thuật: ${selectedTones}.`;
    }
  }

  let maxRetries = 3;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      // Create a fresh instance for each call to support dynamic API key updates
      const apiKey = process.env.GEMINI_API_KEY || "";
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image.split(',')[1],
                mimeType: 'image/png',
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      
      throw new Error("AI did not return an image part.");
    } catch (error: any) {
      const isQuotaError = error?.message?.includes('RESOURCE_EXHAUSTED') || error?.code === 429;
      
      if (isQuotaError && retryCount < maxRetries) {
        retryCount++;
        const waitTime = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
        console.warn(`Quota exceeded. Retrying in ${waitTime}ms... (Attempt ${retryCount}/${maxRetries})`);
        await sleep(waitTime);
        continue;
      }
      
      // If we've exhausted retries or it's a different error, throw it
      throw error;
    }
  }

  throw new Error("Failed to process image after multiple attempts.");
}
