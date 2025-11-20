import React, { useState, useEffect, useRef } from 'react';
import { Car, Users, Share2, Plus, Trash2, UserPlus, X, AlertCircle, ClipboardCheck, Settings, RotateCcw, Calendar, Clock, Megaphone, Backpack, Save, Upload, GripVertical, Check } from 'lucide-react';

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

// --- メインアプリ ---
export default function App() {
  // --- State Management ---
  const [members, setMembers] = useState([
    { id: 1, name: '佐藤 健太' }, { id: 2, name: '鈴木 太郎' }, { id: 3, name: '高橋 花子' },
    { id: 4, name: '田中 次郎' }, { id: 5, name: '伊藤 結衣' }, { id: 6, name: '渡辺 翔太' },
  ]);
  const [cars, setCars] = useState([
    { id: 1, owner: '佐藤ママ', capacity: 7, note: 'ミニバン' },
    { id: 2, owner: '鈴木パパ', capacity: 5, note: '乗用車' },
  ]);
  const [assignments, setAssignments] = useState({});

  const [eventDate, setEventDate] = useState('');
  const [eventName, setEventName] = useState('');
  const [scheduleItems, setScheduleItems] = useState([]);
  const [eventNotes, setEventNotes] = useState('');
  const [eventItems, setEventItems] = useState('');

  const [activeTab, setActiveTab] = useState('allocation');

  // Input Temporary States
  const [tempScheduleTime, setTempScheduleTime] = useState('');
  const [tempScheduleContent, setTempScheduleContent] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newCarOwner, setNewCarOwner] = useState('');
  const [newCarCapacity, setNewCarCapacity] = useState(4);
  const [newCarNote, setNewCarNote] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [draggedMemberId, setDraggedMemberId] = useState(null);

  // --- Persistence (Auto Save/Load) ---
  useEffect(() => {
    if (!eventDate) {
      const today = new Date().toISOString().split('T')[0];
      setEventDate(today);
    }
    const savedData = localStorage.getItem('teamRideDataPro');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.members) setMembers(parsed.members);
        if (parsed.cars) setCars(parsed.cars);
        if (parsed.assignments) setAssignments(parsed.assignments);
        if (parsed.eventDate) setEventDate(parsed.eventDate);
        if (parsed.eventName) setEventName(parsed.eventName);
        if (parsed.scheduleItems) setScheduleItems(parsed.scheduleItems);
        if (parsed.eventNotes) setEventNotes(parsed.eventNotes);
        if (parsed.eventItems) setEventItems(parsed.eventItems);
      } catch (e) {
        console.error("Data Load Error", e);
      }
    }
  }, []);

  useEffect(() => {
    const dataToSave = {
      members, cars, assignments, eventDate, eventName, scheduleItems, eventNotes, eventItems
    };
    localStorage.setItem('teamRideDataPro', JSON.stringify(dataToSave));
  }, [members, cars, assignments, eventDate, eventName, scheduleItems, eventNotes, eventItems]);

  // --- Backup & Restore Functions ---
  const exportData = () => {
    const dataStr = JSON.stringify({
      members, cars, assignments, eventDate, eventName, scheduleItems, eventNotes, eventItems
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
    setMembers([...members, { id: newId, name: newMemberName }]);
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
  const addCar = () => {
    if (!newCarOwner.trim()) return;
    const newId = Date.now();
    setCars([...cars, { id: newId, owner: newCarOwner, capacity: Number(newCarCapacity), note: newCarNote }]);
    setNewCarOwner('');
    setNewCarNote('');
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
            <Car className="w-6 h-6 text-blue-600" />
            Team Ride Pro
          </h1>
          <div className="text-xs font-mono text-slate-400">v2.0 Local</div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">

        {/* Tab Navigation */}
        <nav className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 sticky top-16 z-10 overflow-x-auto">
          {[
            { id: 'allocation', icon: Car, label: '配車' },
            { id: 'schedule', icon: Clock, label: '予定' },
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

        {/* === ALLOCATION TAB === */}
        {activeTab === 'allocation' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Event Info Card */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">日付</label>
                  <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-blue-200" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 ml-2 mb-1 block">大会名</label>
                  <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="大会名を入力" className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-blue-200 placeholder-slate-300" />
                </div>
              </div>
            </div>

            {/* Unassigned Area (Drop Zone) */}
            <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, null)}
                className={`bg-white p-5 rounded-3xl shadow-sm border-2 transition-colors duration-200 ${draggedMemberId ? 'border-dashed border-blue-300 bg-blue-50' : 'border-slate-100'}`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-slate-700 flex items-center gap-2">
                  <div className="bg-orange-100 p-2 rounded-full text-orange-600"><Users className="w-4 h-4" /></div>
                  待機メンバー
                  <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">{unassignedMembers.length}</span>
                </h2>
                <button onClick={() => { if(window.confirm('配車をリセットしますか？')) setAssignments({}) }} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-slate-50">
                  <RotateCcw className="w-3 h-3" /> リセット
                </button>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[60px]">
                {unassignedMembers.length === 0 && !draggedMemberId && (
                  <div className="w-full text-center text-slate-300 text-sm py-4">全員割り当て完了！</div>
                )}
                {unassignedMembers.map(member => (
                  <div
                    key={member.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, member.id, null)}
                    className="cursor-grab active:cursor-grabbing bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-200 text-slate-700 px-3 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-all hover:-translate-y-0.5"
                  >
                    <GripVertical className="w-3 h-3 text-slate-300" />
                    {member.name}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-4 text-center">
                メンバーをドラッグして下の車に入れてください
              </p>
            </div>

            {/* Cars Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {cars.map(car => {
                const carMembers = assignments[car.id] || [];
                const isFull = carMembers.length >= car.capacity;
                const vacancy = car.capacity - carMembers.length;

                return (
                  <div
                    key={car.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, car.id)}
                    className={`bg-white rounded-3xl shadow-sm border-2 transition-all duration-200 overflow-hidden ${
                        draggedMemberId ? (isFull ? 'opacity-50 border-slate-100' : 'border-dashed border-blue-400 bg-blue-50 scale-[1.02]') : 'border-slate-100'
                    }`}
                  >
                    {/* Car Header */}
                    <div className="p-5 text-center border-b border-slate-50 relative">
                      <div className="absolute top-4 right-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isFull ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'}`}>
                           {isFull ? 'FULL' : `あと${vacancy}人`}
                        </span>
                      </div>
                      <div className="w-32 h-20 mx-auto mb-3">{getCarIcon(car.capacity)}</div>
                      <h3 className="font-bold text-lg text-slate-800">{car.owner}<span className="text-sm font-normal text-slate-400">号車</span></h3>
                      <p className="text-xs text-slate-400">{car.capacity}人乗り {car.note && `• ${car.note}`}</p>
                    </div>

                    {/* Car Members (Drop Zone) */}
                    <div className="p-4 bg-slate-50/50 min-h-[100px]">
                      <div className="space-y-2">
                        {carMembers.map(memberId => {
                            const mem = members.find(m => m.id === memberId);
                            if (!mem) return null;
                            return (
                                <div
                                    key={memberId}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, memberId, car.id)}
                                    className="cursor-grab active:cursor-grabbing bg-white px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 border border-slate-100 shadow-sm flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">
                                            {mem.name.charAt(0)}
                                        </div>
                                        {mem.name}
                                    </div>
                                    <button onClick={() => {
                                        // Manual Remove
                                        const newAssign = {...assignments};
                                        newAssign[car.id] = newAssign[car.id].filter(id => id !== memberId);
                                        setAssignments(newAssign);
                                    }} className="text-slate-300 hover:text-red-400">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                        {carMembers.length === 0 && (
                            <div className="text-center text-slate-300 text-xs py-4 italic">ドラッグして乗車</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {cars.length === 0 && (
              <div className="text-center py-10 text-slate-400 bg-white rounded-3xl border border-dashed">
                車が登録されていません。<br/>「設定」タブから追加してください。
              </div>
            )}
          </div>
        )}

        {/* === SCHEDULE TAB === */}
        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Schedule Add */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Clock className="w-5 h-5" /></div>
                    スケジュール
                </h2>
                <div className="bg-slate-50 p-4 rounded-2xl mb-4">
                   <div className="flex flex-col md:flex-row gap-3">
                      <input type="time" className="md:w-1/3 bg-white border-0 rounded-xl px-3 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-purple-200"
                        value={tempScheduleTime} onChange={(e) => setTempScheduleTime(e.target.value)} />
                      <div className="flex-1 flex gap-2">
                          <input type="text" placeholder="予定内容 (例: 集合)" className="flex-1 bg-white border-0 rounded-xl px-4 py-3 font-medium text-slate-700 focus:ring-2 focus:ring-purple-200"
                            value={tempScheduleContent} onChange={(e) => setTempScheduleContent(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addScheduleItem()} />
                          <button onClick={addScheduleItem} className="bg-purple-500 text-white p-3 rounded-xl shadow-lg shadow-purple-200 active:scale-95 transition-transform">
                            <Plus className="w-6 h-6" />
                          </button>
                      </div>
                   </div>
                </div>
                <ul className="space-y-2">
                  {scheduleItems.map((item) => (
                    <li key={item.id} className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-xl shadow-sm">
                      <div className="flex items-center gap-4">
                        <span className="bg-purple-50 text-purple-600 font-bold px-3 py-1 rounded-lg text-sm font-mono">{item.time}</span>
                        <span className="font-bold text-slate-700 text-sm">{item.content}</span>
                      </div>
                      <button onClick={() => removeScheduleItem(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </li>
                  ))}
                  {scheduleItems.length === 0 && <li className="text-center text-slate-300 text-xs py-2">予定なし</li>}
                </ul>
            </div>

            {/* Text Areas */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h2 className="font-bold text-lg mb-3 flex items-center gap-2 text-slate-800">
                        <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600"><Megaphone className="w-4 h-4" /></div>
                        伝達事項
                    </h2>
                    <textarea value={eventNotes} onChange={(e) => setEventNotes(e.target.value)} className="w-full h-32 bg-slate-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-yellow-200 resize-none text-sm text-slate-700" placeholder="注意事項など" />
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h2 className="font-bold text-lg mb-3 flex items-center gap-2 text-slate-800">
                        <div className="bg-pink-100 p-2 rounded-lg text-pink-600"><Backpack className="w-4 h-4" /></div>
                        持ち物
                    </h2>
                    <textarea value={eventItems} onChange={(e) => setEventItems(e.target.value)} className="w-full h-32 bg-slate-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-pink-200 resize-none text-sm text-slate-700" placeholder="・お弁当&#13;&#10;・水筒" />
                </div>
            </div>
          </div>
        )}

        {/* === SHARE TAB === */}
        {activeTab === 'share' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
               <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                 <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><ClipboardCheck className="w-5 h-5" /></div>
                 プレビュー
               </h2>
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                 <pre className="whitespace-pre-wrap font-mono text-xs md:text-sm text-slate-600 leading-relaxed">
                    {generateReport()}
                 </pre>
               </div>
               <button
                  onClick={copyToClipboard}
                  className={`w-full mt-6 py-4 rounded-xl font-bold text-white shadow-lg transition-all flex justify-center items-center gap-2 ${copySuccess ? 'bg-green-500 shadow-green-200' : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'}`}
               >
                  {copySuccess ? <><Check className="w-5 h-5" /> コピーしました！</> : <><Share2 className="w-5 h-5" /> テキストをコピー</>}
               </button>
            </div>
          </div>
        )}

        {/* === SETTINGS TAB === */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Members */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Users className="w-5 h-5" /></div>
                メンバー管理
              </h2>
              <div className="flex gap-2 mb-4">
                <input type="text" placeholder="名前" className="flex-1 bg-slate-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-200"
                  value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addMember()} />
                <button onClick={addMember} className="bg-indigo-600 text-white w-12 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center"><Plus className="w-6 h-6" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {members.map(m => (
                    <div key={m.id} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg">
                        <span className="text-sm font-bold text-slate-700">{m.name}</span>
                        <button onClick={() => deleteMember(m.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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
              <div className="grid gap-3 mb-4 bg-slate-50 p-4 rounded-2xl">
                 <div className="flex gap-2">
                    <input type="text" placeholder="所有者" className="flex-1 bg-white border-0 rounded-xl px-3 py-2 text-sm" value={newCarOwner} onChange={(e) => setNewCarOwner(e.target.value)} />
                    <input type="number" placeholder="定員" className="w-20 bg-white border-0 rounded-xl px-3 py-2 text-sm" value={newCarCapacity} onChange={(e) => setNewCarCapacity(e.target.value)} />
                 </div>
                 <input type="text" placeholder="メモ (荷物車など)" className="w-full bg-white border-0 rounded-xl px-3 py-2 text-sm" value={newCarNote} onChange={(e) => setNewCarNote(e.target.value)} />
                 <button onClick={addCar} className="w-full bg-emerald-500 text-white py-2 rounded-xl font-bold shadow-md shadow-emerald-200">追加</button>
              </div>
              <div className="space-y-2">
                {cars.map(c => (
                    <div key={c.id} className="flex justify-between items-center bg-white border border-slate-100 px-4 py-3 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-8">{getCarIcon(c.capacity)}</div>
                            <div>
                                <div className="text-sm font-bold text-slate-800">{c.owner}号車</div>
                                <div className="text-xs text-slate-400">{c.capacity}人乗り {c.note}</div>
                            </div>
                        </div>
                        <button onClick={() => deleteCar(c.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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

      </main>
    </div>
  );
}
