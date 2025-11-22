// @ts-nocheck
import { useState, useEffect } from 'react';
import { Car, Users, Share2, Plus, Trash2, X, ClipboardCheck, Settings, RotateCcw, Calendar, Save, Upload, GripVertical, Check, UserMinus, UserCheck, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { ref, onValue, set, update } from 'firebase/database';
import { database } from './firebase';
import Login from './Login';

// --- 車種別アイコン (High Quality SVGs) ---
const CarIconMiniVan = () => (
  <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-lg filter transition-all duration-300" fill="none">
    <path d="M10 42H90V48C90 50.2 88.2 52 86 52H14C11.8 52 10 50.2 10 48V42Z" fill="#059669" />
    <path d="M12 25C12 20 15 18 20 18H80C85 18 88 20 88 25V44H12V25Z" fill="#34D399" />
    <path d="M18 22H40V32H16C16.5 28 18 22 18 22Z" fill="#D1FAE5" />
    <rect x="44" y="22" width="20" height="10" rx="1" fill="#D1FAE5" />
    <path d="M68 22H82C81.5 26 81 32 81 32H68V22Z" fill="#D1FAE5" />
    <rect x="10" y="38" width="80" height="4" fill="#047857" fillOpacity="0.3" />
    <circle cx="25" cy="50" r="7" fill="#374151" stroke="#1F2937" strokeWidth="2" />
    <circle cx="25" cy="50" r="3" fill="#D1D5DB" />
    <circle cx="75" cy="50" r="7" fill="#374151" stroke="#1F2937" strokeWidth="2" />
    <circle cx="75" cy="50" r="3" fill="#D1D5DB" />
    <path d="M12 32H10V36H12V32Z" fill="#FCD34D" />
    <path d="M88 32H90V36H88V32Z" fill="#EF4444" />
  </svg>
);

const CarIconSedan = () => (
  <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-lg filter transition-all duration-300" fill="none">
    <path d="M5 42H95V48C95 49.1 94.1 50 93 50H7C5.9 50 5 49.1 5 48V42Z" fill="#2563EB" />
    <path d="M10 32L20 22H70L85 32H90C92.8 32 95 34.2 95 37V44H5V37C5 34.2 7.2 32 10 32Z" fill="#60A5FA" />
    <path d="M25 25H48V32H15L25 25Z" fill="#DBEAFE" />
    <path d="M52 25H68L80 32H52V25Z" fill="#DBEAFE" />
    <rect x="5" y="40" width="90" height="3" fill="#1E40AF" fillOpacity="0.3" />
    <circle cx="25" cy="48" r="7" fill="#374151" stroke="#1F2937" strokeWidth="2" />
    <circle cx="25" cy="48" r="3" fill="#D1D5DB" />
    <circle cx="75" cy="48" r="7" fill="#374151" stroke="#1F2937" strokeWidth="2" />
    <circle cx="75" cy="48" r="3" fill="#D1D5DB" />
    <path d="M5 36H8V39H5V36Z" fill="#FCD34D" />
    <path d="M92 37H95V40H92V37Z" fill="#EF4444" />
  </svg>
);

const CarIconKCar = () => (
  <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-lg filter transition-all duration-300" fill="none">
    <path d="M15 42H85V48C85 50.2 83.2 52 81 52H19C16.8 52 15 50.2 15 48V42Z" fill="#D97706" />
    <path d="M15 30C15 25 18 20 25 20H75C82 20 85 25 85 30V44H15V30Z" fill="#FBBF24" />
    <rect x="22" y="24" width="24" height="12" rx="2" fill="#FEF3C7" />
    <rect x="54" y="24" width="24" height="12" rx="2" fill="#FEF3C7" />
    <path d="M15 38H85" stroke="#B45309" strokeWidth="2" strokeOpacity="0.2" />
    <circle cx="25" cy="50" r="7" fill="#374151" stroke="#1F2937" strokeWidth="2" />
    <circle cx="25" cy="50" r="3" fill="#D1D5DB" />
    <circle cx="75" cy="50" r="7" fill="#374151" stroke="#1F2937" strokeWidth="2" />
    <circle cx="75" cy="50" r="3" fill="#D1D5DB" />
    <circle cx="15" cy="34" r="3" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1" />
    <circle cx="85" cy="34" r="3" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
  </svg>
);

// --- ユーティリティ関数 ---
// ローカルタイムゾーンで日付をYYYY-MM-DD形式に変換
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- メインアプリ ---
export default function App() {
  // --- ログイン状態 ---
  const [userRole, setUserRole] = useState(null); // null | 'admin' | 'viewer'
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- State Management ---
  const [members, setMembers] = useState([
    { id: 1, name: '鋤柄大河', participating: true }, { id: 2, name: '阿南央哉', participating: true }, { id: 3, name: '阿南空希', participating: true },
    { id: 4, name: '小田瑛翔', participating: true }, { id: 5, name: '蒲池心絆', participating: true }, { id: 6, name: '谷口煌汰', participating: true },
    { id: 7, name: '谷口瑛汰', participating: true }, { id: 8, name: '三宅敏京', participating: true }, { id: 9, name: '田中彪翔', participating: true },
    { id: 10, name: '田中彪輝', participating: true }, { id: 11, name: '宮崎絃', participating: true }, { id: 12, name: '彌永和史', participating: true },
    { id: 13, name: '梶原悠生', participating: true }, { id: 14, name: '三苫裕翔', participating: true }, { id: 15, name: '三苫蓮', participating: true },
    { id: 16, name: '溝野翠葉', participating: true }, { id: 17, name: '林佑樹', participating: true }, { id: 18, name: '川内琉太郎', participating: true },
  ]);
  const [cars, setCars] = useState([
    { id: 1, owner: '田中パパ', capacity: 5, note: '乗用車', driver: '田中パパ', familyMembers: [] },
  ]);
  const [assignments, setAssignments] = useState({});

  const [eventDate, setEventDate] = useState('');
  const [eventName, setEventName] = useState('');
  const [scheduleItems, setScheduleItems] = useState([]);
  const [eventNotes, setEventNotes] = useState('');
  const [eventItems, setEventItems] = useState('');

  const [activeTab, setActiveTab] = useState('calendar');

  // Calendar States
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showCarAllocationModal, setShowCarAllocationModal] = useState(false);
  const [currentEventForCarAllocation, setCurrentEventForCarAllocation] = useState(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  // Event Form States
  const [eventFormData, setEventFormData] = useState({
    title: '',
    date: '',
    endDate: '', // 終了日（複数日イベント用）
    startTime: '',
    endTime: '',
    type: 'practice', // practice, tournament, other
    isRecurring: false,
    recurringDays: [], // [0-6] 0=Sunday
    note: '',
    // 配車情報
    cars: [],
    assignments: {},
    scheduleItems: [],
    eventNotes: '',
    eventItems: ''
  });

  // Input Temporary States
  const [tempScheduleTime, setTempScheduleTime] = useState('');
  const [tempScheduleContent, setTempScheduleContent] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newCarOwner, setNewCarOwner] = useState('');
  const [newCarCapacity, setNewCarCapacity] = useState(4);
  const [newCarNote, setNewCarNote] = useState('');
  const [newCarDriver, setNewCarDriver] = useState('');
  const [newCarFamilyMembers, setNewCarFamilyMembers] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [draggedMemberId, setDraggedMemberId] = useState(null);

  // タッチイベント用のstate
  const [touchStartPos, setTouchStartPos] = useState(null);
  const [touchDraggedElement, setTouchDraggedElement] = useState(null);

  // 車選択モーダル用のstate
  const [showCarSelectionModal, setShowCarSelectionModal] = useState(false);

  // --- Firebase Realtime Database統合 ---
  // ログイン後にFirebaseからデータを読み込み、リアルタイム同期を開始
  useEffect(() => {
    if (!userRole) return; // ログインしていない場合は何もしない

    console.log('🔥 Firebase同期開始...');
    setIsDataLoading(true);
    setError(null);

    try {
      let loadedCount = 0;
      const totalToLoad = 3; // members, cars, events

      const checkAllLoaded = () => {
        loadedCount++;
        if (loadedCount >= totalToLoad) {
          setIsDataLoading(false);
          console.log('✅ 全データの読み込み完了');
        }
      };

      // メンバーデータの同期
      const membersRef = ref(database, 'teamData/members');
      const unsubscribeMembers = onValue(membersRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            console.log('📥 Firebaseからメンバーデータを受信:', data);
            const updatedMembers = data.map(m => ({
              ...m,
              participating: m.participating !== undefined ? m.participating : true
            }));
            setMembers(updatedMembers);
          }
          checkAllLoaded();
        } catch (err) {
          console.error('❌ メンバーデータの読み込みエラー:', err);
          setError('メンバーデータの読み込みに失敗しました');
        }
      }, (error) => {
        console.error('❌ Firebaseエラー (members):', error);
        setError('メンバーデータの同期に失敗しました');
        setIsDataLoading(false);
      });

      // 車両データの同期
      const carsRef = ref(database, 'teamData/cars');
      const unsubscribeCars = onValue(carsRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            console.log('📥 Firebaseから車両データを受信:', data);
            setCars(data);
          }
          checkAllLoaded();
        } catch (err) {
          console.error('❌ 車両データの読み込みエラー:', err);
          setError('車両データの読み込みに失敗しました');
        }
      }, (error) => {
        console.error('❌ Firebaseエラー (cars):', error);
        setError('車両データの同期に失敗しました');
        setIsDataLoading(false);
      });

      // カレンダーイベントの同期
      const eventsRef = ref(database, 'teamData/calendarEvents');
      const unsubscribeEvents = onValue(eventsRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            console.log('📥 Firebaseからイベントデータを受信:', data);
            setCalendarEvents(data);
          }
          checkAllLoaded();
        } catch (err) {
          console.error('❌ イベントデータの読み込みエラー:', err);
          setError('イベントデータの読み込みに失敗しました');
        }
      }, (error) => {
        console.error('❌ Firebaseエラー (events):', error);
        setError('イベントデータの同期に失敗しました');
        setIsDataLoading(false);
      });

      // クリーンアップ関数
      return () => {
        unsubscribeMembers();
        unsubscribeCars();
        unsubscribeEvents();
        console.log('🔌 Firebase同期を停止');
      };
    } catch (err) {
      console.error('❌ Firebase初期化エラー:', err);
      setError('Firebaseとの接続に失敗しました');
      setIsDataLoading(false);
    }
  }, [userRole]);

  // データ変更時にFirebaseに保存（管理者のみ）
  useEffect(() => {
    if (!userRole || userRole !== 'admin') return; // 管理者のみ保存可能

    // 初回マウント時は保存しない
    if (members.length === 0 && cars.length === 0 && calendarEvents.length === 0) return;

    console.log('💾 Firebaseにデータを保存中...');

    // メンバーデータを保存
    if (members.length > 0) {
      const membersRef = ref(database, 'teamData/members');
      set(membersRef, members).then(() => {
        console.log('✅ メンバーデータを保存しました');
        setError(null); // エラーをクリア
      }).catch((error) => {
        console.error('❌ メンバーデータの保存に失敗:', error);
        setError('メンバーデータの保存に失敗しました。ネットワーク接続を確認してください。');
      });
    }

    // 車両データを保存
    if (cars.length > 0) {
      const carsRef = ref(database, 'teamData/cars');
      set(carsRef, cars).then(() => {
        console.log('✅ 車両データを保存しました');
        setError(null); // エラーをクリア
      }).catch((error) => {
        console.error('❌ 車両データの保存に失敗:', error);
        setError('車両データの保存に失敗しました。ネットワーク接続を確認してください。');
      });
    }

    // カレンダーイベントを保存
    if (calendarEvents.length > 0) {
      const eventsRef = ref(database, 'teamData/calendarEvents');
      set(eventsRef, calendarEvents).then(() => {
        console.log('✅ イベントデータを保存しました');
        setError(null); // エラーをクリア
      }).catch((error) => {
        console.error('❌ イベントデータの保存に失敗:', error);
        setError('イベントデータの保存に失敗しました。ネットワーク接続を確認してください。');
      });
    }

    // LocalStorageにもバックアップ（オフライン対応）
    const dataToSave = {
      members, cars, calendarEvents
    };
    localStorage.setItem('teamRideDataPro', JSON.stringify(dataToSave));
  }, [members, cars, calendarEvents, userRole]);

  // 初回起動時: LocalStorageからデータを読み込み（Firebaseが空の場合の初期データとして）
  useEffect(() => {
    if (!eventDate) {
      const today = formatLocalDate(new Date());
      setEventDate(today);
    }

    // LocalStorageからデータを読み込み（オフライン時やFirebaseが空の場合の予備）
    const savedData = localStorage.getItem('teamRideDataPro');
    if (savedData && !userRole) { // ログイン前のみLocalStorageから読み込む
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.members) {
          const updatedMembers = parsed.members.map(m => ({
            ...m,
            participating: m.participating !== undefined ? m.participating : true
          }));
          setMembers(updatedMembers);
        }
        if (parsed.cars) setCars(parsed.cars);
        if (parsed.calendarEvents) setCalendarEvents(parsed.calendarEvents);
      } catch (e) {
        console.error("LocalStorageからのデータ読み込みエラー", e);
      }
    }
  }, []);

  // --- Backup & Restore Functions ---
  const exportData = () => {
    const dataStr = JSON.stringify({
      members, cars, assignments, eventDate, eventName, scheduleItems, eventNotes, eventItems, calendarEvents
    }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `team_ride_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (window.confirm('現在のデータを上書きして、バックアップを復元しますか？')) {
          setMembers(parsed.members || []);
          setCars(parsed.cars || []);
          setAssignments(parsed.assignments || {});
          setEventDate(parsed.eventDate || '');
          setEventName(parsed.eventName || '');
          setScheduleItems(parsed.scheduleItems || []);
          setEventNotes(parsed.eventNotes || '');
          setEventItems(parsed.eventItems || '');
          setCalendarEvents(parsed.calendarEvents || []);
          alert('復元が完了しました');
        }
      } catch (err) {
        alert('ファイルの読み込みに失敗しました');
      }
    };
    reader.readAsText(file);
  };

  // --- Logic ---
  const getCarIcon = (capacity) => {
    if (capacity >= 7) return <CarIconMiniVan />;
    if (capacity >= 5) return <CarIconSedan />;
    return <CarIconKCar />;
  };

  // Drag & Drop Logic (Native HTML5)
  const handleDragStart = (e, memberId, fromCarId = null) => {
    setDraggedMemberId({ memberId, fromCarId });
    e.dataTransfer.effectAllowed = "move";
    // 透明なドラッグ画像を設定（オプション）
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetCarId) => {
    e.preventDefault();
    if (!draggedMemberId) return;
    const { memberId, fromCarId } = draggedMemberId;

    // ターゲットの車の定員チェック
    if (targetCarId) { // 車へのドロップ
        const targetCar = cars.find(c => c.id === targetCarId);
        const currentCount = assignments[targetCarId]?.length || 0;
        if (currentCount >= targetCar.capacity && fromCarId !== targetCarId) {
            alert('定員オーバーです！');
            setDraggedMemberId(null);
            return;
        }

        // 配車情報の更新
        const newAssignments = { ...assignments };
        // 元の車から削除
        if (fromCarId) {
            newAssignments[fromCarId] = newAssignments[fromCarId].filter(id => id !== memberId);
        } else {
             // 未割り当てからの移動（何もしなくて良い、下の処理で追加される）
        }
        // 他の全ての車からも念のため削除（重複防止）
        Object.keys(newAssignments).forEach(cId => {
            if (newAssignments[cId]) {
                newAssignments[cId] = newAssignments[cId].filter(id => id !== memberId);
            }
        });

        // 新しい車に追加
        if (!newAssignments[targetCarId]) newAssignments[targetCarId] = [];
        newAssignments[targetCarId].push(memberId);
        setAssignments(newAssignments);

    } else {
        // 未割り当てエリアへのドロップ（車から降ろす）
        if (fromCarId) {
            const newAssignments = { ...assignments };
            newAssignments[fromCarId] = newAssignments[fromCarId].filter(id => id !== memberId);
            setAssignments(newAssignments);
        }
    }
    setDraggedMemberId(null);
  };


  // CRUD Operations
  const addMember = () => {
    if (!newMemberName.trim()) return;
    const newId = Date.now(); // Unique ID
    setMembers([...members, { id: newId, name: newMemberName, participating: true }]);
    setNewMemberName('');
  };
  const deleteMember = (id) => {
    if (!window.confirm('削除しますか？')) return;
    setMembers(members.filter(m => m.id !== id));
    const newAssignments = { ...assignments };
    Object.keys(newAssignments).forEach(carId => {
      newAssignments[carId] = newAssignments[carId].filter(mid => mid !== id);
    });
    setAssignments(newAssignments);
  };
  const toggleParticipation = (id) => {
    console.log('toggleParticipation called with id:', id);
    const updatedMembers = members.map(m => {
      if (m.id === id) {
        console.log('Toggling member:', m.name, 'from', m.participating, 'to', !m.participating);
        return { ...m, participating: !m.participating };
      }
      return m;
    });
    console.log('Updated members:', updatedMembers);
    setMembers(updatedMembers);
  };
  const addCar = () => {
    if (!newCarOwner.trim()) return;
    const newId = Date.now();

    // 同乗家族をカンマ区切りから配列に変換
    const familyMembersArray = newCarFamilyMembers
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    setCars([...cars, {
      id: newId,
      owner: newCarOwner,
      capacity: Number(newCarCapacity),
      note: newCarNote,
      driver: newCarDriver.trim() || newCarOwner, // 運転手が未入力なら所有者を使用
      familyMembers: familyMembersArray
    }]);

    setNewCarOwner('');
    setNewCarNote('');
    setNewCarDriver('');
    setNewCarFamilyMembers('');
  };
  const deleteCar = (id) => {
    if (!window.confirm('削除しますか？')) return;
    setCars(cars.filter(c => c.id !== id));
    const newAssignments = { ...assignments };
    delete newAssignments[id];
    setAssignments(newAssignments);
  };
  const addScheduleItem = () => {
    if (!tempScheduleTime || !tempScheduleContent) return;
    const newItem = { id: Date.now(), time: tempScheduleTime, content: tempScheduleContent };
    const newItems = [...scheduleItems, newItem].sort((a, b) => a.time.localeCompare(b.time));
    setScheduleItems(newItems);
    setTempScheduleTime('');
    setTempScheduleContent('');
  };
  const removeScheduleItem = (id) => setScheduleItems(scheduleItems.filter(i => i.id !== id));

  // Calendar Event Operations
  const saveEvent = () => {
    if (!eventFormData.title || !eventFormData.date) {
      alert('タイトルと日付は必須です');
      return;
    }

    if (editingEvent) {
      // 編集モード
      setCalendarEvents(calendarEvents.map(e =>
        e.id === editingEvent.id ? { ...eventFormData, id: e.id } : e
      ));
    } else {
      // 新規追加
      if (eventFormData.isRecurring && eventFormData.recurringDays.length > 0) {
        // 繰り返しスケジュール：次の12週間分のイベントを生成
        const newEvents = [];
        const startDate = new Date(eventFormData.date);
        const weeksToGenerate = 12;

        for (let week = 0; week < weeksToGenerate; week++) {
          eventFormData.recurringDays.forEach(dayOfWeek => {
            const eventDate = new Date(startDate);
            // 開始日から指定曜日までの日数を計算
            const daysUntilTarget = (dayOfWeek - startDate.getDay() + 7) % 7;
            eventDate.setDate(startDate.getDate() + daysUntilTarget + (week * 7));

            newEvents.push({
              ...eventFormData,
              date: formatLocalDate(eventDate),
              id: Date.now() + newEvents.length,
              isRecurring: false // 生成されたイベントは個別に扱う
            });
          });
        }

        setCalendarEvents([...calendarEvents, ...newEvents]);
      } else {
        // 通常のイベント追加
        const newEvent = {
          ...eventFormData,
          id: Date.now()
        };
        setCalendarEvents([...calendarEvents, newEvent]);
      }
    }

    // フォームをリセット
    setEventFormData({
      title: '',
      date: '',
      endDate: '',
      startTime: '',
      endTime: '',
      type: 'practice',
      isRecurring: false,
      recurringDays: [],
      note: '',
      cars: [],
      assignments: {},
      scheduleItems: [],
      eventNotes: '',
      eventItems: ''
    });
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const deleteEvent = (id) => {
    if (window.confirm('このイベントを削除しますか？')) {
      setCalendarEvents(calendarEvents.filter(e => e.id !== id));
    }
  };

  // イベントの配車データを更新する関数
  const updateEventCarData = (eventId, updates) => {
    const updatedEvents = calendarEvents.map(event =>
      event.id === eventId ? { ...event, ...updates } : event
    );
    setCalendarEvents(updatedEvents);

    // 現在編集中のイベントも更新
    if (currentEventForCarAllocation && currentEventForCarAllocation.id === eventId) {
      setCurrentEventForCarAllocation({ ...currentEventForCarAllocation, ...updates });
    }

    // イベントモーダルで編集中の場合も更新
    if (editingEvent && editingEvent.id === eventId) {
      setEditingEvent({ ...editingEvent, ...updates });
      setEventFormData({ ...eventFormData, ...updates });
    }
  };

  // Reports
  const generateReport = () => {
    const dateObj = new Date(eventDate);
    const formattedDate = isNaN(dateObj.getTime()) ? '日付未定' : dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
    const title = eventName.trim() ? eventName : '活動予定';

    let report = `📅 ${title} (${formattedDate})\n\n`;
    if (scheduleItems.length > 0) {
        report += `⏰ スケジュール\n` + scheduleItems.map(i => `${i.time} ${i.content}`).join('\n') + `\n\n`;
    }
    if (eventNotes.trim()) report += `📢 伝達事項\n${eventNotes.trim()}\n\n`;
    if (eventItems.trim()) report += `🎒 持ってくるもの\n${eventItems.trim()}\n\n`;

    report += `------------------\n🚗 配車表\n`;
    cars.forEach(car => {
      const carMembers = assignments[car.id] || [];
      const names = carMembers.map(mid => members.find(m => m.id === mid)?.name || '不明').join('、');
      report += `【${car.owner}号車】(${carMembers.length}/${car.capacity})${car.note ? ` ※${car.note}` : ''}\n`;
      report += carMembers.length > 0 ? `メンバー: ${names}\n` : `メンバー: なし\n`;
      report += `\n`;
    });
    const assignedIds = Object.values(assignments).flat();
    const unassigned = members.filter(m => !assignedIds.includes(m.id));
    if (unassigned.length > 0) report += `⚠️ 未割り当て: ${unassigned.map(m => m.name).join('、')}\n`;
    return report;
  };

  const copyToClipboard = () => {
    const text = generateReport();
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {}
    document.body.removeChild(textArea);
  };

  const assignedIds = Object.values(assignments).flat();
  const unassignedMembers = members.filter(m => !assignedIds.includes(m.id));

  // ログイン処理
  const handleLogin = (role) => {
    setUserRole(role);
    sessionStorage.setItem('userRole', role);
  };

  // ログアウト処理
  const handleLogout = () => {
    setUserRole(null);
    sessionStorage.removeItem('userRole');
  };

  // セッション復元
  useEffect(() => {
    const savedRole = sessionStorage.getItem('userRole');
    if (savedRole) {
      setUserRole(savedRole);
    }
    setIsLoading(false);
  }, []);

  // ログインしていない場合はログイン画面を表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400">読み込み中...</div>
      </div>
    );
  }

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  // 権限チェック関数
  const isAdmin = userRole === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
            <Car className="w-6 h-6 text-blue-600" />
            Little Brave Schedule管理Pro
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-xs">
              <span className={`px-2 py-1 rounded-full font-bold ${isAdmin ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                {isAdmin ? '管理者' : '閲覧者'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              title="ログアウト"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-fadeIn">
            <div className="bg-red-100 p-2 rounded-lg text-red-600 flex-shrink-0">
              <X className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-800 mb-1">エラーが発生しました</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
              title="閉じる"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ローディング状態 */}
        {isDataLoading && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center gap-3 animate-fadeIn">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-sm text-blue-700 font-medium">
              Firebaseからデータを読み込んでいます...
            </p>
          </div>
        )}

        {/* Tab Navigation */}
        <nav className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 sticky top-16 z-10 overflow-x-auto">
          {[
            { id: 'calendar', icon: Calendar, label: 'カレンダー' },
            { id: 'share', icon: Share2, label: '共有' },
            { id: 'settings', icon: Settings, label: '設定' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[80px] py-2.5 px-2 rounded-xl flex flex-col md:flex-row items-center justify-center gap-1.5 text-xs md:text-sm font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 transform scale-[1.02]'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>


        {/* === CALENDAR TAB === */}
        {activeTab === 'calendar' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Calendar Header */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                  <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Calendar className="w-5 h-5" /></div>
                  カレンダー
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(currentMonth.getMonth() - 1);
                      setCurrentMonth(newMonth);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <h3 className="font-bold text-slate-700 min-w-[120px] text-center">
                    {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
                  </h3>
                  <button
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(currentMonth.getMonth() + 1);
                      setCurrentMonth(newMonth);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="bg-slate-50 rounded-2xl p-4">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                    <div
                      key={day}
                      className={`text-center text-xs font-bold py-2 ${
                        i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-600'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {(() => {
                    const year = currentMonth.getFullYear();
                    const month = currentMonth.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const days = [];

                    // Empty cells for days before month starts
                    for (let i = 0; i < firstDay; i++) {
                      days.push(
                        <div key={`empty-${i}`} className="aspect-square p-1"></div>
                      );
                    }

                    // Days of the month
                    for (let day = 1; day <= daysInMonth; day++) {
                      const date = new Date(year, month, day);
                      const dateStr = formatLocalDate(date);
                      const isToday = dateStr === formatLocalDate(new Date());
                      const dayOfWeek = date.getDay();

                      // Filter events for this day (including multi-day events)
                      const dayEvents = calendarEvents.filter(event => {
                        const eventStart = event.date;
                        const eventEnd = event.endDate || event.date;
                        return dateStr >= eventStart && dateStr <= eventEnd;
                      });

                      days.push(
                        <div
                          key={day}
                          className={`aspect-square p-1 rounded-lg border transition-all hover:shadow-md ${
                            isToday
                              ? 'bg-blue-100 border-blue-300 font-bold'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`text-xs font-bold ${
                              dayOfWeek === 0
                                ? 'text-red-500'
                                : dayOfWeek === 6
                                ? 'text-blue-500'
                                : 'text-slate-700'
                            }`}
                          >
                            {day}
                          </div>

                          {/* Display events */}
                          <div className="mt-1 space-y-0.5 overflow-y-auto max-h-16">
                            {dayEvents.map(event => {
                              const eventColor =
                                event.type === 'practice' ? 'bg-blue-500' :
                                event.type === 'tournament' ? 'bg-red-500' :
                                'bg-gray-500';

                              return (
                                <div
                                  key={event.id}
                                  onClick={(e) => {
                                    if (!isAdmin) return; // 閲覧者は編集不可
                                    e.stopPropagation();
                                    setEditingEvent(event);
                                    setEventFormData(event);
                                    setShowEventModal(true);
                                  }}
                                  className={`${eventColor} text-white text-[10px] px-1 py-0.5 rounded ${isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-default'} transition-opacity truncate`}
                                  title={event.title}
                                >
                                  {event.title}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    return days;
                  })()}
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => setShowEventModal(true)}
                  className="w-full mt-4 bg-purple-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  イベントを追加
                </button>
              )}
            </div>
          </div>
        )}

        {/* === SHARE TAB === */}
        {activeTab === 'share' && (() => {
          const generateEventReport = (event) => {
            const dateObj = new Date(event.date);
            const formattedDate = dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

            let report = `📅 ${event.title} (${formattedDate})\n\n`;

            if (event.startTime || event.endTime) {
              report += `⏰ 時間\n${event.startTime || '未定'} 〜 ${event.endTime || '未定'}\n\n`;
            }

            if (event.scheduleItems && event.scheduleItems.length > 0) {
              report += `⏰ スケジュール\n` + event.scheduleItems.map(i => `${i.time} ${i.content}`).join('\n') + `\n\n`;
            }

            if (event.note && event.note.trim()) {
              report += `📢 メモ\n${event.note.trim()}\n\n`;
            }

            if (event.eventNotes && event.eventNotes.trim()) {
              report += `📢 伝達事項\n${event.eventNotes.trim()}\n\n`;
            }

            if (event.eventItems && event.eventItems.trim()) {
              report += `🎒 持ってくるもの\n${event.eventItems.trim()}\n\n`;
            }

            const eventCars = event.cars || [];
            const eventAssignments = event.assignments || {};

            if (eventCars.length > 0) {
              report += `------------------\n🚗 配車表\n`;
              eventCars.forEach(car => {
                const carMembers = eventAssignments[car.id] || [];
                const names = carMembers.map(mid => members.find(m => m.id === mid)?.name || '不明').join('、');

                // 運転手(1) + 同乗家族 + メンバー
                const familyCount = car.familyMembers ? car.familyMembers.length : 0;
                const usedSeats = 1 + familyCount + carMembers.length;

                report += `【${car.owner}号車】(${usedSeats}/${car.capacity}人)${car.note ? ` ※${car.note}` : ''}\n`;

                // 運転手を表示
                if (car.driver) {
                  report += `🚗 運転手: ${car.driver}\n`;
                }

                // 同乗家族を表示
                if (car.familyMembers && car.familyMembers.length > 0) {
                  report += `👨‍👩‍👧‍👦 同乗家族: ${car.familyMembers.join('、')}\n`;
                }

                // メンバーを表示
                report += carMembers.length > 0 ? `メンバー: ${names}\n` : `メンバー: なし\n`;
                report += `\n`;
              });

              const assignedIds = Object.values(eventAssignments).flat();
              const unassigned = members.filter(m => !assignedIds.includes(m.id) && m.participating);
              if (unassigned.length > 0) {
                report += `⚠️ 未割り当て: ${unassigned.map(m => m.name).join('、')}\n`;
              }
            } else {
              report += `------------------\n🚗 配車表\n（まだ配車が登録されていません）\n`;
            }

            return report;
          };

          const copyEventToClipboard = (event) => {
            const text = generateEventReport(event);
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
          };

          // 今日以降のイベントのみをフィルタリング
          const today = formatLocalDate(new Date());
          const futureEvents = calendarEvents.filter(event => {
            const eventEnd = event.endDate || event.date;
            return eventEnd >= today;
          });

          // 複数日イベントを各日ごとに展開
          const expandedEvents = [];
          futureEvents.forEach(event => {
            const startDate = new Date(event.date);
            const endDate = event.endDate ? new Date(event.endDate) : new Date(event.date);

            // 開始日から終了日まで1日ずつループ
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
              const dateStr = formatLocalDate(currentDate);
              if (dateStr >= today) {
                expandedEvents.push({
                  ...event,
                  date: dateStr, // この日の日付を使用
                  displayDate: dateStr,
                  uniqueKey: `${event.id}-${dateStr}`
                });
              }
              currentDate.setDate(currentDate.getDate() + 1);
            }
          });

          // 日付順にソート（近い順）
          expandedEvents.sort((a, b) => new Date(a.displayDate) - new Date(b.displayDate));

          return (
            <div className="space-y-6 animate-fadeIn">
              {expandedEvents.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500 mb-2">未来の予定がありません</p>
                  <p className="text-xs text-slate-400">カレンダータブからイベントを追加してください</p>
                </div>
              ) : (
                expandedEvents.map(eventDay => {
                  const displayDateObj = new Date(eventDay.displayDate);
                  const formattedDisplayDate = displayDateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

                  return (
                    <div key={eventDay.uniqueKey} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                      <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><ClipboardCheck className="w-5 h-5" /></div>
                        {eventDay.title} - {formattedDisplayDate}
                      </h2>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <pre className="whitespace-pre-wrap font-mono text-xs md:text-sm text-slate-600 leading-relaxed">
                          {generateEventReport(eventDay)}
                        </pre>
                      </div>
                      <button
                        onClick={() => copyEventToClipboard(eventDay)}
                        className={`w-full mt-6 py-4 rounded-xl font-bold text-white shadow-lg transition-all flex justify-center items-center gap-2 ${copySuccess ? 'bg-green-500 shadow-green-200' : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'}`}
                      >
                      {copySuccess ? <><Check className="w-5 h-5" /> コピーしました！</> : <><Share2 className="w-5 h-5" /> テキストをコピー</>}
                    </button>
                  </div>
                  );
                })
              )}
            </div>
          );
        })()}

        {/* === SETTINGS TAB === */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Members */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Users className="w-5 h-5" /></div>
                メンバー管理
              </h2>
              {isAdmin && (
                <div className="flex gap-2 mb-4">
                  <input type="text" placeholder="名前" className="flex-1 bg-slate-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-200"
                    value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addMember()} />
                  <button onClick={addMember} className="bg-indigo-600 text-white w-12 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center"><Plus className="w-6 h-6" /></button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                {members.map(m => (
                    <div key={m.id} className={`flex justify-between items-center px-3 py-2 rounded-lg transition-all ${
                      m.participating
                        ? 'bg-slate-50 border border-slate-200'
                        : 'bg-slate-200 border border-slate-300 opacity-60'
                    }`}>
                        <div className="flex items-center gap-2 flex-1">
                          {isAdmin ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleParticipation(m.id);
                              }}
                              className={`transition-colors ${
                                m.participating
                                  ? 'text-green-600 hover:text-green-700'
                                  : 'text-slate-400 hover:text-slate-500'
                              }`}
                              title={m.participating ? '参加中（クリックで不参加に）' : '不参加（クリックで参加に）'}
                            >
                              {m.participating ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                            </button>
                          ) : (
                            <span className={m.participating ? 'text-green-600' : 'text-slate-400'}>
                              {m.participating ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                            </span>
                          )}
                          <span className={`text-sm font-bold ${m.participating ? 'text-slate-700' : 'text-slate-500 line-through'}`}>
                            {m.name}
                          </span>
                        </div>
                        {isAdmin && (
                          <button onClick={() => deleteMember(m.id)} className="text-slate-300 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                    </div>
                ))}
              </div>
            </div>

            {/* Cars */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><Car className="w-5 h-5" /></div>
                車両管理
              </h2>
              {isAdmin && (
                <div className="grid gap-3 mb-4 bg-slate-50 p-4 rounded-2xl">
                   <div className="flex gap-2">
                      <input type="text" placeholder="所有者" className="flex-1 bg-white border-0 rounded-xl px-3 py-2 text-sm" value={newCarOwner} onChange={(e) => setNewCarOwner(e.target.value)} />
                      <input type="number" placeholder="定員" className="w-20 bg-white border-0 rounded-xl px-3 py-2 text-sm" value={newCarCapacity} onChange={(e) => setNewCarCapacity(e.target.value)} />
                   </div>
                   <input type="text" placeholder="運転手 (未入力時は所有者)" className="w-full bg-white border-0 rounded-xl px-3 py-2 text-sm" value={newCarDriver} onChange={(e) => setNewCarDriver(e.target.value)} />
                   <input type="text" placeholder="同乗家族 (カンマ区切り: 例 田中ママ,田中太郎)" className="w-full bg-white border-0 rounded-xl px-3 py-2 text-sm" value={newCarFamilyMembers} onChange={(e) => setNewCarFamilyMembers(e.target.value)} />
                   <input type="text" placeholder="メモ (荷物車など)" className="w-full bg-white border-0 rounded-xl px-3 py-2 text-sm" value={newCarNote} onChange={(e) => setNewCarNote(e.target.value)} />
                   <button onClick={addCar} className="w-full bg-emerald-500 text-white py-2 rounded-xl font-bold shadow-md shadow-emerald-200">追加</button>
                </div>
              )}
              <div className="space-y-2">
                {cars.map(c => (
                    <div key={c.id} className="bg-white border border-slate-100 px-4 py-3 rounded-xl">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-12 h-8 mt-1">{getCarIcon(c.capacity)}</div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-slate-800">{c.owner}号車</div>
                                <div className="text-xs text-slate-400 mb-2">{c.capacity}人乗り {c.note}</div>
                                {c.driver && (
                                  <div className="text-xs mb-1">
                                    <span className="text-slate-500">運転手:</span>
                                    <span className="ml-1 font-medium text-slate-700">{c.driver}</span>
                                  </div>
                                )}
                                {c.familyMembers && c.familyMembers.length > 0 && (
                                  <div className="text-xs">
                                    <span className="text-slate-500">同乗家族:</span>
                                    <span className="ml-1 font-medium text-slate-700">
                                      {c.familyMembers.join('、')} ({c.familyMembers.length}人)
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>
                          {isAdmin && (
                            <button onClick={() => deleteCar(c.id)} className="text-slate-300 hover:text-red-500 ml-2"><Trash2 className="w-4 h-4" /></button>
                          )}
                        </div>
                    </div>
                ))}
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
               <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                 <div className="bg-slate-100 p-2 rounded-lg text-slate-600"><Save className="w-5 h-5" /></div>
                 データ引継ぎ・バックアップ
               </h2>
               <p className="text-xs text-slate-400 mb-4">
                 設定やメンバー情報をファイルに保存したり、他の端末からデータを読み込んだりできます。
               </p>
               <div className="grid grid-cols-2 gap-4">
                 <button onClick={exportData} className="flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-2xl p-4 transition-colors">
                    <Save className="w-6 h-6 text-blue-500" />
                    <span className="text-xs font-bold text-slate-600">ファイルに保存</span>
                 </button>
                 <label className="cursor-pointer flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 rounded-2xl p-4 transition-colors">
                    <Upload className="w-6 h-6 text-orange-500" />
                    <span className="text-xs font-bold text-slate-600">ファイルを読込</span>
                    <input type="file" accept=".json" onChange={importData} className="hidden" />
                 </label>
               </div>
            </div>

          </div>
        )}

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEventModal(false)}>
            <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">{editingEvent ? 'イベント編集' : 'イベント追加'}</h3>
                <button onClick={() => setShowEventModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* イベントタイプ */}
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">種類</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'practice', label: '練習', color: 'bg-blue-100 text-blue-700 border-blue-300' },
                      { value: 'tournament', label: '大会', color: 'bg-red-100 text-red-700 border-red-300' },
                      { value: 'other', label: 'その他', color: 'bg-slate-100 text-slate-700 border-slate-300' }
                    ].map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          const newFormData = { ...eventFormData, type: type.value };
                          // 練習タイプに切り替えた時、デフォルトで「通常練習」を設定
                          if (type.value === 'practice' && !eventFormData.title) {
                            newFormData.title = '通常練習';
                          }
                          setEventFormData(newFormData);
                        }}
                        className={`py-2 px-3 rounded-lg border-2 text-xs font-bold transition-all ${
                          eventFormData.type === type.value ? type.color : 'bg-white text-slate-400 border-slate-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* タイトル */}
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">タイトル *</label>
                  {eventFormData.type === 'practice' ? (
                    <div className="grid grid-cols-2 gap-2">
                      {['通常練習', '休日練習'].map(practiceType => (
                        <button
                          key={practiceType}
                          type="button"
                          onClick={() => setEventFormData({ ...eventFormData, title: practiceType })}
                          className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${
                            eventFormData.title === practiceType
                              ? 'bg-blue-100 text-blue-700 border-blue-300'
                              : 'bg-white text-slate-400 border-slate-200'
                          }`}
                        >
                          {practiceType}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={eventFormData.title}
                      onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                      className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-200"
                      placeholder="例: 練習試合"
                    />
                  )}
                </div>

                {/* 日付 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">開始日 *</label>
                    <input
                      type="date"
                      value={eventFormData.date}
                      onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
                      className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">終了日（複数日の場合）</label>
                    <input
                      type="date"
                      value={eventFormData.endDate}
                      onChange={(e) => setEventFormData({ ...eventFormData, endDate: e.target.value })}
                      min={eventFormData.date}
                      className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-200"
                      placeholder="同じ日の場合は空欄"
                    />
                  </div>
                </div>

                {/* 時間 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">開始時間</label>
                    <input
                      type="time"
                      value={eventFormData.startTime}
                      onChange={(e) => setEventFormData({ ...eventFormData, startTime: e.target.value })}
                      className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">終了時間</label>
                    <input
                      type="time"
                      value={eventFormData.endTime}
                      onChange={(e) => setEventFormData({ ...eventFormData, endTime: e.target.value })}
                      className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                </div>

                {/* メモ */}
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">メモ</label>
                  <textarea
                    value={eventFormData.note}
                    onChange={(e) => setEventFormData({ ...eventFormData, note: e.target.value })}
                    className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-200 resize-none"
                    rows="3"
                    placeholder="場所や持ち物など"
                  />
                </div>

                {/* 繰り返し設定 (新規作成時のみ) */}
                {!editingEvent && (
                  <div className="border-t border-slate-200 pt-4">
                    <label className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        checked={eventFormData.isRecurring}
                        onChange={(e) => setEventFormData({ ...eventFormData, isRecurring: e.target.checked })}
                        className="w-4 h-4 text-purple-500 rounded focus:ring-2 focus:ring-purple-200"
                      />
                      <span className="text-xs font-bold text-slate-600">繰り返しスケジュール</span>
                    </label>

                    {eventFormData.isRecurring && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 block">曜日を選択（次の12週間分を生成）</label>
                        <div className="grid grid-cols-7 gap-1">
                          {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => {
                            const isSelected = eventFormData.recurringDays.includes(index);
                            return (
                              <button
                                key={index}
                                type="button"
                                onClick={() => {
                                  const newDays = isSelected
                                    ? eventFormData.recurringDays.filter(d => d !== index)
                                    : [...eventFormData.recurringDays, index];
                                  setEventFormData({ ...eventFormData, recurringDays: newDays });
                                }}
                                className={`py-2 px-1 text-xs font-bold rounded-lg transition-all ${
                                  isSelected
                                    ? index === 0
                                      ? 'bg-red-500 text-white'
                                      : index === 6
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-purple-500 text-white'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ボタン */}
                <div className="space-y-2">
                  {/* 配車ボタン (編集時のみ表示) */}
                  {editingEvent && (
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentEventForCarAllocation(editingEvent);
                        setShowCarAllocationModal(true);
                      }}
                      className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Car className="w-5 h-5" />
                      配車
                    </button>
                  )}

                  {/* 保存・削除ボタン */}
                  <div className="flex gap-2">
                    {editingEvent && (
                      <button
                        type="button"
                        onClick={() => {
                          deleteEvent(editingEvent.id);
                          setShowEventModal(false);
                          setEditingEvent(null);
                        }}
                        className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
                      >
                        削除
                      </button>
                    )}
                    <button
                      onClick={saveEvent}
                      className={`${editingEvent ? 'flex-1' : 'w-full'} bg-purple-500 text-white py-3 rounded-xl font-bold hover:bg-purple-600 transition-colors`}
                    >
                      保存
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Car Allocation Modal */}
        {showCarAllocationModal && currentEventForCarAllocation && (() => {
          const eventCars = currentEventForCarAllocation.cars || [];
          const eventAssignments = currentEventForCarAllocation.assignments || {};

          // 参加メンバーの計算
          const assignedMemberIds = Object.values(eventAssignments).flat();
          const eventUnassignedMembers = members.filter(m => !assignedMemberIds.includes(m.id));

          // メンバーを選択/選択解除
          const toggleMemberSelection = (memberId, e) => {
            e.stopPropagation();
            setSelectedMemberIds(prev =>
              prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
            );
          };

          // 選択を全てクリア
          const clearSelection = () => {
            setSelectedMemberIds([]);
          };

          // イベント専用のドラッグ&ドロップハンドラー
          const handleEventDrop = (e, targetCarId) => {
            e.preventDefault();
            if (!draggedMemberId) return;
            const { memberId, fromCarId } = draggedMemberId;

            // ドラッグしたメンバーが選択されている場合は、全選択メンバーを移動
            const membersToMove = selectedMemberIds.includes(memberId)
              ? selectedMemberIds
              : [memberId];

            const newAssignments = { ...eventAssignments };

            // 容量チェック
            if (targetCarId) {
              const targetCar = eventCars.find(c => c.id === targetCarId);
              const currentMembers = newAssignments[targetCarId] || [];
              const availableSpace = targetCar.capacity - 1 - currentMembers.length;

              if (membersToMove.length > availableSpace) {
                alert(`容量不足です。空き: ${availableSpace}人、移動: ${membersToMove.length}人`);
                setDraggedMemberId(null);
                return;
              }
            }

            // 全メンバーを移動
            membersToMove.forEach(id => {
              const member = members.find(m => m.id === id);
              if (!member || !member.participating) return;

              // 元の車から削除
              Object.keys(newAssignments).forEach(carId => {
                newAssignments[carId] = (newAssignments[carId] || []).filter(mid => mid !== id);
              });

              // 新しい車に追加
              if (targetCarId) {
                newAssignments[targetCarId] = [...(newAssignments[targetCarId] || []), id];
              }
            });

            updateEventCarData(currentEventForCarAllocation.id, { assignments: newAssignments });
            setDraggedMemberId(null);
            clearSelection();
          };

          // タッチイベント用のハンドラー
          const handleTouchStart = (e, memberId, fromCarId) => {
            if (!members.find(m => m.id === memberId)?.participating) return;

            const touch = e.touches[0];
            setTouchStartPos({ x: touch.clientX, y: touch.clientY });
            setDraggedMemberId({ memberId, fromCarId });
            setTouchDraggedElement(e.currentTarget);

            // 長押しでドラッグ開始のフィードバック
            e.currentTarget.style.opacity = '0.7';
            e.currentTarget.style.transform = 'scale(1.05)';
          };

          const handleTouchMove = (e) => {
            if (!draggedMemberId || !touchStartPos) return;
            e.preventDefault(); // スクロールを防ぐ

            const touch = e.touches[0];
            const element = touchDraggedElement;

            if (element) {
              // ドラッグ中の要素を移動（視覚的フィードバック）
              element.style.position = 'fixed';
              element.style.left = `${touch.clientX - 50}px`;
              element.style.top = `${touch.clientY - 20}px`;
              element.style.zIndex = '9999';
              element.style.pointerEvents = 'none';
            }
          };

          const handleTouchEnd = (e) => {
            if (!draggedMemberId) return;

            const touch = e.changedTouches[0];
            const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

            // リセット
            if (touchDraggedElement) {
              touchDraggedElement.style.position = '';
              touchDraggedElement.style.left = '';
              touchDraggedElement.style.top = '';
              touchDraggedElement.style.zIndex = '';
              touchDraggedElement.style.opacity = '';
              touchDraggedElement.style.transform = '';
              touchDraggedElement.style.pointerEvents = '';
            }

            // ドロップ先を判定
            let targetCarId = null;
            let currentElement = dropTarget;

            // 親要素を遡ってdata-car-id属性を探す
            while (currentElement && currentElement !== document.body) {
              if (currentElement.dataset && currentElement.dataset.carId) {
                targetCarId = parseInt(currentElement.dataset.carId);
                break;
              }
              if (currentElement.dataset && currentElement.dataset.unassignedArea === 'true') {
                targetCarId = null;
                break;
              }
              currentElement = currentElement.parentElement;
            }

            // ドロップ処理を実行
            if (currentElement && currentElement !== document.body) {
              const { memberId, fromCarId } = draggedMemberId;
              const membersToMove = selectedMemberIds.includes(memberId)
                ? selectedMemberIds
                : [memberId];

              const newAssignments = { ...eventAssignments };

              // 容量チェック
              if (targetCarId) {
                const targetCar = eventCars.find(c => c.id === targetCarId);
                const currentMembers = newAssignments[targetCarId] || [];
                const availableSpace = targetCar.capacity - 1 - currentMembers.length;

                if (membersToMove.length > availableSpace) {
                  alert(`容量不足です。空き: ${availableSpace}人、移動: ${membersToMove.length}人`);
                  setDraggedMemberId(null);
                  setTouchStartPos(null);
                  setTouchDraggedElement(null);
                  return;
                }
              }

              // 全メンバーを移動
              membersToMove.forEach(id => {
                const member = members.find(m => m.id === id);
                if (!member || !member.participating) return;

                // 元の車から削除
                Object.keys(newAssignments).forEach(carId => {
                  newAssignments[carId] = (newAssignments[carId] || []).filter(mid => mid !== id);
                });

                // 新しい車に追加
                if (targetCarId) {
                  newAssignments[targetCarId] = [...(newAssignments[targetCarId] || []), id];
                }
              });

              updateEventCarData(currentEventForCarAllocation.id, { assignments: newAssignments });
              clearSelection();
            }

            setDraggedMemberId(null);
            setTouchStartPos(null);
            setTouchDraggedElement(null);
          };

          const closeModal = () => {
            setShowCarAllocationModal(false);
            setSelectedMemberIds([]);
          };

          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
              <div className="bg-white rounded-3xl p-6 max-w-7xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{currentEventForCarAllocation.title}</h3>
                    <p className="text-sm text-slate-500">{currentEventForCarAllocation.date} の配車</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* 待機メンバー */}
                  <div
                    data-unassigned-area="true"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleEventDrop(e, null)}
                    onTouchMove={handleTouchMove}
                    className={`bg-white p-5 rounded-3xl shadow-sm border-2 transition-colors duration-200 ${draggedMemberId ? 'border-dashed border-blue-300 bg-blue-50' : 'border-slate-100'}`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-bold text-slate-700 flex items-center gap-2">
                        <div className="bg-orange-100 p-2 rounded-full text-orange-600"><Users className="w-4 h-4" /></div>
                        待機メンバー
                        <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">{eventUnassignedMembers.length}</span>
                        {selectedMemberIds.length > 0 && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{selectedMemberIds.length}人選択中</span>
                        )}
                      </h2>
                      <div className="flex gap-2">
                        {selectedMemberIds.length > 0 && (
                          <button
                            onClick={clearSelection}
                            className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-blue-50"
                          >
                            <X className="w-3 h-3" /> 選択解除
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm('配車をリセットしますか？')) {
                              updateEventCarData(currentEventForCarAllocation.id, { assignments: {} });
                            }
                          }}
                          className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-slate-50"
                        >
                          <RotateCcw className="w-3 h-3" /> リセット
                        </button>
                      </div>
                    </div>

                    {/* 選択中のメンバーがいる場合、配車先選択ボタンを表示 */}
                    {selectedMemberIds.length > 0 && (
                      <div className="mb-4">
                        <button
                          onClick={() => setShowCarSelectionModal(true)}
                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                          <Car className="w-5 h-5" />
                          配車先を選択 ({selectedMemberIds.length}人)
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 min-h-[60px]">
                      {eventUnassignedMembers.length === 0 && !draggedMemberId && (
                        <div className="w-full text-center text-slate-300 text-sm py-4">全員割り当て完了！</div>
                      )}
                      {eventUnassignedMembers.map(member => {
                        const isSelected = selectedMemberIds.includes(member.id);
                        return (
                          <div
                            key={member.id}
                            draggable={member.participating}
                            onDragStart={(e) => member.participating && handleDragStart(e, member.id, null)}
                            onTouchStart={(e) => member.participating && handleTouchStart(e, member.id, null)}
                            onTouchEnd={handleTouchEnd}
                            onClick={(e) => {
                              if (member.participating && !e.defaultPrevented) {
                                toggleMemberSelection(member.id, e);
                              }
                            }}
                            className={`px-2 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center gap-1 transition-all ${
                              member.participating
                                ? isSelected
                                  ? 'cursor-grab active:cursor-grabbing bg-blue-500 hover:bg-blue-600 border-2 border-blue-600 text-white scale-105'
                                  : 'cursor-grab active:cursor-grabbing bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-200 text-slate-700 hover:-translate-y-0.5'
                                : 'bg-slate-200 border border-slate-300 text-slate-500 opacity-60'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                toggleParticipation(member.id);
                              }}
                              className={`p-1 rounded transition-colors ${
                                member.participating
                                  ? isSelected
                                    ? 'hover:bg-blue-400 text-white hover:text-white'
                                    : 'hover:bg-orange-100 text-slate-400 hover:text-orange-600'
                                  : 'hover:bg-slate-300 text-slate-500 hover:text-slate-600'
                              }`}
                              title={member.participating ? 'クリックで不参加にする' : 'クリックで参加にする'}
                            >
                              {member.participating ? (
                                <GripVertical className="w-3 h-3" />
                              ) : (
                                <UserMinus className="w-3 h-3" />
                              )}
                            </button>
                            <span className={member.participating ? '' : 'line-through'}>{member.name}</span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-slate-400 mt-4 text-center">
                      メンバーをクリックで選択してまとめてドラッグ、または1人ずつドラッグして車に入れてください
                    </p>
                  </div>

                  {/* 車の追加 */}
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
                      <Car className="w-4 h-4 text-blue-600" />
                      車を追加
                    </h3>

                    {/* 登録済み車両から追加 */}
                    {cars.length > 0 && (
                      <div className="mb-3 pb-3 border-b border-slate-100">
                        <p className="text-xs text-slate-500 mb-2">登録済み車両から追加</p>
                        <div className="flex gap-2">
                          <select
                            className="flex-1 bg-slate-50 border-0 rounded-xl px-3 py-2 text-sm"
                            id={`registeredCarSelect-${currentEventForCarAllocation.id}`}
                          >
                            <option value="">選択してください</option>
                            {cars.map(car => (
                              <option key={car.id} value={car.id}>
                                {car.owner}号車 ({car.capacity}人乗り)
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              const selectEl = document.getElementById(`registeredCarSelect-${currentEventForCarAllocation.id}`);
                              const selectedCarId = parseInt(selectEl.value);

                              if (!selectedCarId) {
                                alert('車両を選択してください');
                                return;
                              }

                              const selectedCar = cars.find(c => c.id === selectedCarId);
                              if (!selectedCar) return;

                              const newCar = {
                                id: Date.now(),
                                owner: selectedCar.owner,
                                capacity: selectedCar.capacity,
                                note: selectedCar.note
                              };

                              updateEventCarData(currentEventForCarAllocation.id, {
                                cars: [...eventCars, newCar]
                              });

                              selectEl.value = '';
                            }}
                            className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-600 transition-colors"
                          >
                            追加
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 手動で追加 */}
                    <p className="text-xs text-slate-500 mb-2">手動で追加</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="運転者名"
                        className="flex-1 bg-slate-50 border-0 rounded-xl px-3 py-2 text-sm"
                        id={`eventCarOwner-${currentEventForCarAllocation.id}`}
                      />
                      <select
                        className="bg-slate-50 border-0 rounded-xl px-3 py-2 text-sm"
                        id={`eventCarCapacity-${currentEventForCarAllocation.id}`}
                        defaultValue="4"
                      >
                        <option value="4">4人乗り</option>
                        <option value="5">5人乗り</option>
                        <option value="6">6人乗り</option>
                        <option value="7">7人乗り</option>
                        <option value="8">8人乗り</option>
                      </select>
                      <button
                        onClick={() => {
                          const ownerInput = document.getElementById(`eventCarOwner-${currentEventForCarAllocation.id}`);
                          const capacitySelect = document.getElementById(`eventCarCapacity-${currentEventForCarAllocation.id}`);
                          const owner = ownerInput.value.trim();
                          const capacity = parseInt(capacitySelect.value);

                          if (!owner) {
                            alert('運転者名を入力してください');
                            return;
                          }

                          const newCar = {
                            id: Date.now(),
                            owner,
                            capacity,
                            note: capacity >= 7 ? 'ミニバン' : capacity >= 5 ? '乗用車' : '軽自動車'
                          };

                          updateEventCarData(currentEventForCarAllocation.id, {
                            cars: [...eventCars, newCar]
                          });

                          ownerInput.value = '';
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors"
                      >
                        追加
                      </button>
                    </div>
                  </div>

                  {/* 車一覧 */}
                  <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {eventCars.map(car => {
                      const carMembers = eventAssignments[car.id] || [];
                      // 運転手(1) + 同乗家族 + 配車されたメンバー
                      const familyCount = car.familyMembers ? car.familyMembers.length : 0;
                      const usedSeats = 1 + familyCount + carMembers.length; // 運転手 + 同乗家族 + メンバー
                      const vacancy = car.capacity - usedSeats;
                      const isFull = vacancy <= 0;

                      return (
                        <div
                          key={car.id}
                          data-car-id={car.id}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleEventDrop(e, car.id)}
                          onTouchMove={handleTouchMove}
                          className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 overflow-hidden ${
                            draggedMemberId ? (isFull ? 'opacity-50 border-slate-100' : 'border-dashed border-blue-400 bg-blue-50 scale-[1.02]') : 'border-slate-100'
                          }`}
                        >
                          {/* Car Header */}
                          <div className="p-2 text-center border-b border-slate-50 relative">
                            <div className="absolute top-1 right-1">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isFull ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'}`}>
                                {isFull ? 'FULL' : `+${vacancy}`}
                              </span>
                            </div>
                            <div className="w-16 h-10 mx-auto mb-1">{getCarIcon(car.capacity)}</div>
                            <h3 className="font-bold text-xs text-slate-800">{car.owner}<span className="text-[10px] font-normal text-slate-400">号車</span></h3>
                            <p className="text-[10px] text-slate-400">{car.capacity}人乗 ({usedSeats}/{car.capacity}人)</p>
                            {car.driver && (
                              <p className="text-[9px] text-blue-600 mt-1">
                                🚗 {car.driver}
                              </p>
                            )}
                            {car.familyMembers && car.familyMembers.length > 0 && (
                              <p className="text-[9px] text-green-600">
                                👨‍👩‍👧‍👦 {car.familyMembers.join('、')}
                              </p>
                            )}
                            <button
                              onClick={() => {
                                if (window.confirm('この車を削除しますか？')) {
                                  const newAssignments = { ...eventAssignments };
                                  delete newAssignments[car.id];
                                  updateEventCarData(currentEventForCarAllocation.id, {
                                    cars: eventCars.filter(c => c.id !== car.id),
                                    assignments: newAssignments
                                  });
                                }
                              }}
                              className="absolute top-1 left-1 text-slate-300 hover:text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Car Members */}
                          <div className="p-2 bg-slate-50/50 min-h-[60px]">
                            <div className="space-y-1">
                              {carMembers.map(memberId => {
                                const mem = members.find(m => m.id === memberId);
                                if (!mem) return null;
                                const isSelected = selectedMemberIds.includes(memberId);
                                return (
                                  <div
                                    key={memberId}
                                    draggable={mem.participating}
                                    onDragStart={(e) => mem.participating && handleDragStart(e, memberId, car.id)}
                                    onTouchStart={(e) => mem.participating && handleTouchStart(e, memberId, car.id)}
                                    onTouchEnd={handleTouchEnd}
                                    onClick={(e) => {
                                      if (mem.participating && !e.defaultPrevented) {
                                        toggleMemberSelection(memberId, e);
                                      }
                                    }}
                                    className={`px-2 py-1 rounded-lg text-[11px] font-bold border shadow-sm flex justify-between items-center transition-all ${
                                      mem.participating
                                        ? isSelected
                                          ? 'cursor-grab active:cursor-grabbing bg-blue-500 text-white border-blue-600 scale-105'
                                          : 'cursor-grab active:cursor-grabbing bg-white text-slate-700 border-slate-100'
                                        : 'bg-slate-100 text-slate-500 border-slate-200 opacity-60'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1">
                                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${
                                        mem.participating
                                          ? isSelected
                                            ? 'bg-blue-300 text-white'
                                            : 'bg-blue-100 text-blue-600'
                                          : 'bg-slate-200 text-slate-500'
                                      }`}>
                                        {mem.participating ? mem.name.charAt(0) : '×'}
                                      </div>
                                      <span className={mem.participating ? '' : 'line-through'}>{mem.name}</span>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        const newAssignments = { ...eventAssignments };
                                        newAssignments[car.id] = newAssignments[car.id].filter(id => id !== memberId);
                                        updateEventCarData(currentEventForCarAllocation.id, { assignments: newAssignments });
                                      }}
                                      className={isSelected ? 'text-blue-200 hover:text-white' : 'text-slate-300 hover:text-red-400'}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}
                              {carMembers.length === 0 && (
                                <div className="text-center text-slate-300 text-[10px] py-2 italic">ドラッグ</div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {eventCars.length === 0 && (
                    <div className="text-center text-slate-400 py-8">
                      <Car className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">まだ車が登録されていません</p>
                      <p className="text-xs">上のフォームから車を追加してください</p>
                    </div>
                  )}

                  {/* 閉じるボタン */}
                  <button
                    onClick={() => setShowCarAllocationModal(false)}
                    className="w-full bg-purple-500 text-white py-3 rounded-xl font-bold hover:bg-purple-600 transition-colors"
                  >
                    完了
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 車選択モーダル */}
        {showCarSelectionModal && currentEventForCarAllocation && (() => {
          const eventCars = currentEventForCarAllocation.cars || [];
          const eventAssignments = currentEventForCarAllocation.assignments || {};

          const assignMembersToCar = (carId) => {
            const newAssignments = { ...eventAssignments };
            const targetCar = eventCars.find(c => c.id === carId);

            if (!targetCar) return;

            // 容量チェック
            const currentMembers = newAssignments[carId] || [];
            const familyCount = targetCar.familyMembers ? targetCar.familyMembers.length : 0;
            const currentUsedSeats = 1 + familyCount + currentMembers.length; // 運転手 + 同乗家族 + 現在のメンバー
            const availableSpace = targetCar.capacity - currentUsedSeats;

            if (selectedMemberIds.length > availableSpace) {
              alert(`容量不足です。\n空き: ${availableSpace}人\n移動: ${selectedMemberIds.length}人`);
              return;
            }

            // 選択したメンバーを車に配置
            selectedMemberIds.forEach(memberId => {
              const member = members.find(m => m.id === memberId);
              if (!member || !member.participating) return;

              // 他の車から削除
              Object.keys(newAssignments).forEach(cId => {
                newAssignments[cId] = (newAssignments[cId] || []).filter(mid => mid !== memberId);
              });

              // 選択した車に追加
              newAssignments[carId] = [...(newAssignments[carId] || []), memberId];
            });

            updateEventCarData(currentEventForCarAllocation.id, { assignments: newAssignments });
            setSelectedMemberIds([]);
            setShowCarSelectionModal(false);
          };

          return (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
              onClick={() => setShowCarSelectionModal(false)}
            >
              <div
                className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Car className="w-6 h-6 text-blue-600" />
                  配車先を選択
                </h2>

                <p className="text-sm text-slate-500 mb-4">
                  選択中: <span className="font-bold text-blue-600">{selectedMemberIds.length}人</span>
                  {selectedMemberIds.map(id => {
                    const m = members.find(mem => mem.id === id);
                    return m ? m.name : '';
                  }).join('、')}
                </p>

                <div className="space-y-3 mb-6">
                  {eventCars.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                      <p className="text-sm">車が登録されていません</p>
                    </div>
                  ) : (
                    eventCars.map(car => {
                      const carMembers = eventAssignments[car.id] || [];
                      // 運転手(1) + 同乗家族 + 現在のメンバー + 選択中のメンバー
                      const familyCount = car.familyMembers ? car.familyMembers.length : 0;
                      const currentUsedSeats = 1 + familyCount + carMembers.length;
                      const vacancy = car.capacity - currentUsedSeats;
                      const isFull = vacancy < selectedMemberIds.length;

                      return (
                        <button
                          key={car.id}
                          onClick={() => !isFull && assignMembersToCar(car.id)}
                          disabled={isFull}
                          className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                            isFull
                              ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                              : 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-8">{getCarIcon(car.capacity)}</div>
                              <div>
                                <div className="font-bold text-slate-800">{car.owner}号車</div>
                                <div className="text-xs text-slate-500">{car.capacity}人乗り</div>
                              </div>
                            </div>
                            <div className="text-right">
                              {isFull ? (
                                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">
                                  容量不足
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                  空き {vacancy}席
                                </span>
                              )}
                            </div>
                          </div>

                          {carMembers.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-100">
                              <div className="text-xs text-slate-400 mb-1">乗車中:</div>
                              <div className="flex flex-wrap gap-1">
                                {carMembers.map(mid => {
                                  const m = members.find(mem => mem.id === mid);
                                  return m ? (
                                    <span key={mid} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                      {m.name}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                <button
                  onClick={() => setShowCarSelectionModal(false)}
                  className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          );
        })()}

      </main>
    </div>
  );
}
