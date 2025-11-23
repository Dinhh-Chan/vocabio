# Vocabio - Ứng dụng học từ vựng thông minh

Ứng dụng học từ vựng tương tự Quizlet với nhiều tính năng nâng cao, tích hợp thuật toán SRS (Spaced Repetition System) để tối ưu hóa việc ghi nhớ từ vựng.

## 🚀 Tính năng chính

### 1. Quản lý từ vựng
- Tạo và quản lý từ vựng với nhiều định nghĩa
- Hỗ trợ phát âm audio, phiên âm IPA
- Thêm ví dụ và ghi chú
- Gắn nhãn/tag và phân loại theo chủ đề

### 2. Quản lý học phần (Study Set)
- Tạo học phần chứa danh sách từ vựng
- Sắp xếp và quản lý thứ tự từ
- Theo dõi tiến độ học tập

### 3. Flashcard với SRS
- Học từ bằng thẻ flashcard
- Tích hợp thuật toán SRS (SM-2) để tối ưu lịch ôn tập
- Nhiều chế độ học: lật thẻ, đoán nghĩa, đoán từ

### 4. Bài kiểm tra (Quiz)
- Nhiều loại câu hỏi: trắc nghiệm, điền từ, nghe-viết, v.v.
- Tự động tạo bài test từ AI
- Theo dõi kết quả và điểm số

### 5. Thư viện
- Tổ chức học phần theo thư mục
- Quản lý lớp học (cho giáo viên)
- Chia sẻ nội dung học tập

### 6. Thống kê và Hoạt động
- Theo dõi tiến độ học tập
- Biểu đồ streak và thời gian học
- Thống kê từ vựng đã thuộc/chưa thuộc

## 📁 Cấu trúc dự án

```
fe/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Màn hình học (Flashcard)
│   │   ├── library.tsx    # Thư viện
│   │   ├── statistics.tsx # Thống kê
│   │   └── profile.tsx     # Cá nhân
│   ├── vocabulary/        # Quản lý từ vựng
│   ├── study-set/         # Quản lý học phần
│   └── login.tsx          # Đăng nhập
├── components/            # React components
│   ├── stack-card-view.tsx # Flashcard component
│   └── ui/                # UI components
├── services/              # API services
│   ├── api.ts             # Base API client
│   ├── auth.service.ts    # Authentication
│   ├── vocabulary.service.ts
│   ├── study-set.service.ts
│   ├── srs.service.ts     # SRS algorithm
│   ├── quiz.service.ts
│   ├── folder.service.ts
│   └── statistics.service.ts
├── types/                  # TypeScript types
│   └── index.ts           # All type definitions
├── hooks/                  # Custom React hooks
│   ├── use-auth.ts        # Authentication hook
│   └── use-color-scheme.ts
├── constants/             # App constants
│   ├── config.ts          # API config, SRS config
│   └── theme.ts           # Theme colors
└── utils/                 # Utility functions
    └── srs.ts             # SRS calculations
```

## 🛠️ Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Cấu hình biến môi trường:
Tạo file `.env` hoặc cập nhật trong `constants/config.ts`:
```
EXPO_PUBLIC_API_URL=http://your-backend-url/api
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

3. Chạy ứng dụng:
```bash
npm start
```

## 📱 Màn hình chính

### Tab Navigation
- **Học**: Flashcard với SRS, hiển thị từ vựng cần ôn
- **Thư viện**: Quản lý thư mục, học phần, bài kiểm tra
- **Thống kê**: Xem tiến độ học tập, streak, điểm số
- **Cá nhân**: Thông tin tài khoản, cài đặt

### Màn hình quản lý
- `/vocabulary/create`: Tạo từ vựng mới
- `/study-set/create`: Tạo học phần mới
- `/login`: Đăng nhập với Google

## 🔌 API Services

Tất cả các service đều được định nghĩa trong thư mục `services/`:

- `apiService`: Base HTTP client với authentication
- `authService`: Google OAuth, quản lý session
- `vocabularyService`: CRUD từ vựng, import, AI features
- `studySetService`: Quản lý học phần
- `srsService`: SRS algorithm, lấy từ cần ôn
- `quizService`: Tạo và quản lý bài kiểm tra
- `folderService`: Quản lý thư mục
- `statisticsService`: Thống kê và hoạt động

## 🧮 Thuật toán SRS

Ứng dụng sử dụng thuật toán SM-2 (SuperMemo 2) để tính toán lịch ôn tập:

- **Easiness Factor**: Điều chỉnh dựa trên chất lượng trả lời (0-5)
- **Interval**: Khoảng thời gian đến lần ôn tiếp theo
- **Repetitions**: Số lần đã ôn thành công

Từ vựng được phân loại:
- **New**: Chưa học
- **Learning**: Đang học
- **Mastered**: Đã thuộc (repetitions >= 5, interval >= 30 ngày)

## 🎨 Theme

Ứng dụng hỗ trợ Dark/Light mode tự động:
- Sử dụng `useColorScheme()` hook
- Themed components: `ThemedText`, `ThemedView`
- Colors được định nghĩa trong `constants/theme.ts`

## 📝 Database Schema

Xem file database schema trong backend để hiểu cấu trúc dữ liệu:
- User, Vocabulary, StudySet
- Folder, FolderItem
- SrsProgress
- Quiz, QuizQuestion, QuizAnswer, QuizResult

## 🚧 Tính năng đang phát triển

- [ ] Game modes (Matching, Typing Race, Word Puzzle)
- [ ] Extension thêm từ vựng từ trình duyệt
- [ ] Import từ CSV/Excel/Google Sheet
- [ ] AI sinh ngữ cảnh và trích xuất từ vựng
- [ ] Thông báo nhắc học
- [ ] Lớp học cho giáo viên
- [ ] Chia sẻ học phần

## 📚 Tài liệu tham khảo

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [SM-2 Algorithm](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)

## 📄 License

Private project
