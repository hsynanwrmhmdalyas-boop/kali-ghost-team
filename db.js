/**
 * ============================================================================
 * KALI COMMUNITY - UNIFIED DATABASE & STORAGE ENGINE (DB.JS)
 * Features:
 * 1. Persistent Storage (LocalStorage + Cross-Tab Sync)
 * 2. Real-Time Discussions & Member Chat Room (مناقشات الأعضاء الحية)
 * 3. Complete CRUD API for Posts, Comments, Likes, Topics, Members, Stats
 * 4. Rich Member Profiles (Specialty, Bio, Contributions)
 * 5. Firebase Firestore Bridge
 * ============================================================================
 */

(function (window) {
  'use strict';

  const APP_VERSION = '2026.11.24.4';
  const VERSION_STORAGE_KEY = 'kali_app_version';
  const STORAGE_KEYS = {
    POSTS: 'kali_comm_posts_v2',
    TOPICS: 'kali_comm_topics_v2',
    MEMBERS: 'kali_comm_members_v2',
    DISCUSSIONS: 'kali_comm_discussions_v2',
    STATS: 'kali_comm_stats_v2',
    USER: 'kali_comm_current_user_v2',
    SETTINGS: 'kali_comm_settings_v2'
  };

  // Seed default data if storage is empty
  const DEFAULT_POSTS = [
    {
      id: 'post_1',
      author: 'حسين أنور (KALI)',
      authorAvatar: 'K',
      role: 'مؤسس المجتمع',
      topicTag: 'مجتمعنا',
      content: 'أهلاً بكل أعضاء KALI COMMUNITY الجدد! 🚀 هذا المجتمع بُني ليكون منصة عربية حرة لتبادل المعرفة في مجالات الأمن السيبراني، الشبكات، البرمجة، والأنظمة. شاركونا أفكاركم وأي سؤال تقني مرحب به دائماً!',
      time: 'منذ ساعتين',
      timestamp: Date.now() - 7200000,
      likesCount: 24,
      likedBy: [],
      pinned: true,
      comments: [
        {
          id: 'c_1',
          author: 'أحمد النور',
          avatar: 'A',
          text: 'بالتوفيق يا بشمهندس حسين! فكرة ممتازة جداً ونحن في انتظار ورش العمل.',
          time: 'منذ ساعة'
        }
      ]
    },
    {
      id: 'post_2',
      author: 'Network Learner',
      authorAvatar: 'N',
      role: 'عضو مميز',
      topicTag: 'الشبكات',
      content: 'نصيحة للمبتدئين في الشبكات: ابدأوا بفهم عناوين IP و Subnet Mask و DNS و DHCP. الأساس القوي في نموذج OSI هو الذي يسهل عليكم بعد ذلك فهم مواضيع أمن الشبكات والـ Penetration Testing.',
      time: 'منذ 5 ساعات',
      timestamp: Date.now() - 18000000,
      likesCount: 18,
      likedBy: [],
      pinned: false,
      comments: [
        {
          id: 'c_2',
          author: 'Security Fan',
          avatar: 'S',
          text: 'كلام سليم 100%، بدون فهم عميق لحزم البيانات (Packets) يصعب تحليل الثغرات.',
          time: 'منذ 3 ساعات'
        }
      ]
    },
    {
      id: 'post_3',
      author: 'Cyber Hunter',
      authorAvatar: 'C',
      role: 'خبير أمان',
      topicTag: 'الأمن السيبراني',
      content: 'تنبيه أمني: احرصوا دائماً على تفعيل المصادقة الثنائية (2FA) وتجنب استخدام كلمات المرور المكررة بين الحسابات. الهندسة الاجتماعية هي أكثر الطرق شيوعاً للاختراق اليوم.',
      time: 'منذ يوم',
      timestamp: Date.now() - 86400000,
      likesCount: 31,
      likedBy: [],
      pinned: false,
      comments: []
    }
  ];

  // Live discussions between members
  const DEFAULT_DISCUSSIONS = [
    {
      id: 'disc_1',
      sender: 'Ahmed Al-Noor',
      senderAvatar: 'A',
      role: 'عضو مهتم بالأمن',
      text: 'السلام عليكم يا شباب، عندي استفسار: ما هي أفضل توزيعة لينكس للمبتدئين في تعلم اختبار الاختراق غير كالي؟',
      time: 'منذ 25 دقيقة',
      timestamp: Date.now() - 1500000,
      replyTo: null
    },
    {
      id: 'disc_2',
      sender: 'حسين أنور (KALI)',
      senderAvatar: 'K',
      role: 'مؤسس المجتمع',
      text: '@Ahmed Al-Noor وعليكم السلام ورحمة الله! كبداية ممتازة أنصحك بتوزيعة Parrot Security OS لأنها خفيفة ومستقرة، أو تثبيت أوبونتو وتثبيت الأدوات مثل nmap و wireshark يدوياً لتعلم كيفية عمل كل أداة.',
      time: 'منذ 18 دقيقة',
      timestamp: Date.now() - 1080000,
      replyTo: 'disc_1'
    },
    {
      id: 'disc_3',
      sender: 'Security Fan',
      senderAvatar: 'S',
      role: 'مختبر اختراق',
      text: '@Ahmed Al-Noor وأهم خطوة تبدأ بها هي بيئة افتراضية (VirtualBox) وتطبيق عملي على منصات مثل TryHackMe أو HackTheBox.',
      time: 'منذ 12 دقيقة',
      timestamp: Date.now() - 720000,
      replyTo: 'disc_1'
    },
    {
      id: 'disc_4',
      sender: 'Sara IT',
      senderAvatar: 'S',
      role: 'طالبة تقنية معلومات',
      text: 'يا جماعة سؤال لطلاب جامعة الجزيرة: هل معمل هياكل البيانات غداً يتطلب تجهيز كود الأشجار (Binary Trees) مسبقاً؟',
      time: 'منذ 7 دقائق',
      timestamp: Date.now() - 420000,
      replyTo: null
    },
    {
      id: 'disc_5',
      sender: 'حسين أنور (KALI)',
      senderAvatar: 'K',
      role: 'مؤسس المجتمع',
      text: '@Sara IT نعم يفضل مراجعة مفاهيم التكرار (Recursion) وبناء العقدة Node في لغة Java/Dart عشان التطبيق العملي يكون سريع.',
      time: 'منذ دقيقتين',
      timestamp: Date.now() - 120000,
      replyTo: 'disc_4'
    }
  ];

  const DEFAULT_TOPICS = [
    { id: 't_1', icon: '🛡️', name: 'الأمن السيبراني', count: 48 },
    { id: 't_2', icon: '🌐', name: 'الشبكات', count: 36 },
    { id: 't_3', icon: '💻', name: 'البرمجة', count: 52 },
    { id: 't_4', icon: '🐧', name: 'Linux وKali', count: 29 },
    { id: 't_5', icon: '🤖', name: 'الذكاء الاصطناعي', count: 17 },
    { id: 't_6', icon: '📱', name: 'تطوير الموبايل (Flutter)', count: 23 }
  ];

  // Rich member cards
  const DEFAULT_MEMBERS = [
    {
      id: 'm_1',
      name: 'حسين أنور',
      avatar: 'K',
      role: 'مؤسس / Admin',
      specialty: 'تطوير تطبيقات Flutter وهندسة البرمجيات والأمن السيبراني',
      bio: 'طالب تقنية معلومات (المستوى الثاني) بجامعة الجزيرة. شغوف بالهوية السيبرانية وبناء الحلول الرقمية متعددة المنصات.',
      contributionsCount: 42,
      isOnline: true
    },
    {
      id: 'm_2',
      name: 'Ahmed Al-Noor',
      avatar: 'A',
      role: 'عضو نشط',
      specialty: 'الشبكات وبروتوكولات Cisco و Wireshark',
      bio: 'مهتم بفحص حزم البيانات وتأمين الشبكات المحلية والروابط اللاسلكية.',
      contributionsCount: 16,
      isOnline: true
    },
    {
      id: 'm_3',
      name: 'Mohamed Dev',
      avatar: 'M',
      role: 'مشرف تقني',
      specialty: 'تطوير الويب Backend بلغات Python و Node.js',
      bio: 'أعمل على بناء واجهات برمجة التطبيقات REST APIs وحماية قواعد البيانات.',
      contributionsCount: 28,
      isOnline: true
    },
    {
      id: 'm_4',
      name: 'Security Fan',
      avatar: 'S',
      role: 'خبير أمان',
      specialty: 'اختبار الاختراق (Penetration Testing) وتوزيعات Linux',
      bio: 'حل تحديات CTF والبحث عن الثغرات الأمنية بطرق أخلاقية ومسؤولة.',
      contributionsCount: 31,
      isOnline: false
    },
    {
      id: 'm_5',
      name: 'Sara IT',
      avatar: 'S',
      role: 'طالبة تقنية معلومات',
      specialty: 'هياكل البيانات والبرمجة الكائنية وتصميم النظم',
      bio: 'طالبة في كلية تقنية المعلومات جامعة الجزيرة، مهتمة بتصميم الخوارزميات الفعالة.',
      contributionsCount: 19,
      isOnline: true
    }
  ];

  const DEFAULT_STATS = {
    membersCount: '+1K',
    topicsCount: '+250',
    uptime: '24/7'
  };

  const DEFAULT_SETTINGS = {
    adminPasswordHash: '576abd4742653e99eceb205e09dc5ee8c06d527ad74d58e82e5a9d73fb1b83d5', // default hash: change the password right after first login

    siteTitle: 'KALI COMMUNITY',
    heroNotice: 'مجتمع التقنية والأمن السيبراني',
    allowGuestPosting: true,
    firebaseConfig: null,
    ghostWelcomeMessage: 'مرحباً بك في تيم الشبح',
    ghostWelcomeSubtext: 'تم تفعيل هويتك الرقمية بنجاح كعضو رسمي في تيم الشبح بقيادة KALI HUSSEIN.'
  };

  // Deep Prototype Pollution defense helper
  function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sanitizeObject);
    const clean = {};
    for (const key of Object.keys(obj)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      clean[key] = sanitizeObject(obj[key]);
    }
    return clean;
  }

  function loadJSON(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? sanitizeObject(JSON.parse(data)) : fallback;
    } catch (e) {
      console.warn('Storage read error for key:', key, e);
      return fallback;
    }
  }

  function saveJSON(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('kali_db_updated', { detail: { key } }));
    } catch (e) {
      console.error('Storage write error for key:', key, e);
    }
  }


  // ---------------------------------------------------------------------------
  // Security helpers
  // ---------------------------------------------------------------------------
  const ADMIN_SESSION_KEY = 'kali_admin_session';
  const LOGIN_GUARD_KEY = 'kali_login_guard';
  const ADMIN_SESSION_MS = 2 * 60 * 60 * 1000; // 2 hours
  const PBKDF2_ITERATIONS = 150000;

  // Strip control / bidi-spoofing characters, trim and limit the length
  function cleanText(value, max) {
    return String(value == null ? '' : value)
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '')
      .trim()
      .slice(0, max);
  }

  function randomHex(bytes) {
    const a = new Uint8Array(bytes);
    window.crypto.getRandomValues(a);
    return Array.from(a).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Unpredictable ids (Date.now() alone can collide / be guessed)
  function uid(prefix) {
    let r;
    try { r = randomHex(4); } catch (e) { r = Math.random().toString(36).slice(2, 10); }
    return prefix + Date.now() + '_' + r;
  }

  function hexToBytes(hex) {
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
    return out;
  }

  function safeEqual(a, b) {
    a = String(a); b = String(b);
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
  }

  async function pbkdf2Hex(password, saltHex, iterations) {
    const enc = new TextEncoder();
    const key = await window.crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await window.crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt: hexToBytes(saltHex), iterations: iterations },
      key, 256
    );
    return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function readLoginGuard() {
    try {
      const g = JSON.parse(localStorage.getItem(LOGIN_GUARD_KEY));
      if (g && typeof g === 'object') return { fails: +g.fails || 0, until: +g.until || 0, level: +g.level || 0 };
    } catch (e) {}
    return { fails: 0, until: 0, level: 0 };
  }
  function writeLoginGuard(g) {
    try { localStorage.setItem(LOGIN_GUARD_KEY, JSON.stringify(g)); } catch (e) {}
  }

  const DB = {
    init: function () {
      // 1. Initial Seeding if first time
      if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
        saveJSON(STORAGE_KEYS.POSTS, DEFAULT_POSTS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.DISCUSSIONS)) {
        saveJSON(STORAGE_KEYS.DISCUSSIONS, DEFAULT_DISCUSSIONS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.TOPICS)) {
        saveJSON(STORAGE_KEYS.TOPICS, DEFAULT_TOPICS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
        saveJSON(STORAGE_KEYS.MEMBERS, DEFAULT_MEMBERS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.STATS)) {
        saveJSON(STORAGE_KEYS.STATS, DEFAULT_STATS);
      }

      // 2. Dynamic Settings Migration & Auto-Sync
      const savedSettings = loadJSON(STORAGE_KEYS.SETTINGS, null);
      if (!savedSettings) {
        saveJSON(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      } else {
        // Merge missing default keys into saved settings seamlessly
        let needsUpdate = false;
        const merged = { ...DEFAULT_SETTINGS, ...savedSettings };
        
                // Migrate the legacy hash to the current default hash
        if (merged.adminPasswordHash === 'a4b06341397774dacd1e23fdb6705b53e5901dba00cb3270feb0ec9e454a35e6') {
          merged.adminPasswordHash = DEFAULT_SETTINGS.adminPasswordHash;
          needsUpdate = true;
        }
        // Purge legacy plain password if it was 'kali'
        if (merged.adminPassword === 'kali') {
          delete merged.adminPassword;
          merged.adminPasswordHash = DEFAULT_SETTINGS.adminPasswordHash;
          needsUpdate = true;
        }
        if (!merged.adminPasswordHash) {
          merged.adminPasswordHash = DEFAULT_SETTINGS.adminPasswordHash;
          needsUpdate = true;
        }

        if (needsUpdate || JSON.stringify(merged) !== JSON.stringify(savedSettings)) {
          saveJSON(STORAGE_KEYS.SETTINGS, merged);
        }
      }

      // 3. Version Tracking for instant client update detection
      const currentClientVer = localStorage.getItem(VERSION_STORAGE_KEY);
      if (currentClientVer !== APP_VERSION) {
        localStorage.setItem(VERSION_STORAGE_KEY, APP_VERSION);
        console.log(`[KALI_DB] Successfully upgraded to App Version: ${APP_VERSION}`);
      }
    },

    getVersion: function () {
      return APP_VERSION;
    },

    // ----------------- POSTS -----------------
    getPosts: function (topicFilter) {
      let posts = loadJSON(STORAGE_KEYS.POSTS, DEFAULT_POSTS);
      if (topicFilter && topicFilter !== 'all') {
        posts = posts.filter(p => p.topicTag === topicFilter);
      }
      return posts.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (b.timestamp || 0) - (a.timestamp || 0);
      });
    },

    addPost: function (postData) {
      postData = postData || {};
      const content = cleanText(postData.content, 1000);
      if (!content) return null;

      const posts = loadJSON(STORAGE_KEYS.POSTS, DEFAULT_POSTS);
      const user = this.getCurrentUser() || { name: 'عضو جديد', avatar: 'U', role: 'عضو' };
      const adm = this.isAdminSession(); // only an authenticated admin may post under another identity

      const author = cleanText(adm && postData.author ? postData.author : user.name, 60) || 'عضو';
      const newPost = {
        id: uid('post_'),
        author: author,
        authorAvatar: cleanText(adm && postData.authorAvatar ? postData.authorAvatar : (user.avatar || author.charAt(0).toUpperCase()), 4),
        role: cleanText(adm && postData.role ? postData.role : (user.role || 'عضو'), 40) || 'عضو',
        topicTag: cleanText(postData.topicTag, 40) || 'نقاش عام',
        content: content,
        time: 'الآن',
        timestamp: Date.now(),
        likesCount: 0,
        likedBy: [],
        pinned: false,
        comments: []
      };

      posts.unshift(newPost);
      saveJSON(STORAGE_KEYS.POSTS, posts);
      return newPost;
    },

    deletePost: function (postId) {
      if (!this._requireAdmin()) return false;
      let posts = loadJSON(STORAGE_KEYS.POSTS, DEFAULT_POSTS);
      posts = posts.filter(p => p.id !== postId);
      saveJSON(STORAGE_KEYS.POSTS, posts);
      return true;
    },

    toggleLike: function (postId, userId) {
      const posts = loadJSON(STORAGE_KEYS.POSTS, DEFAULT_POSTS);
      const post = posts.find(p => p.id === postId);
      if (!post) return { liked: false, count: 0 };

      const uid = userId || (this.getCurrentUser() ? this.getCurrentUser().id : 'guest_' + navigator.userAgent.slice(0, 8));
      if (!Array.isArray(post.likedBy)) post.likedBy = [];

      const idx = post.likedBy.indexOf(uid);
      let liked = false;
      if (idx > -1) {
        post.likedBy.splice(idx, 1);
        post.likesCount = Math.max(0, (post.likesCount || 1) - 1);
        liked = false;
      } else {
        post.likedBy.push(uid);
        post.likesCount = (post.likesCount || 0) + 1;
        liked = true;
      }

      saveJSON(STORAGE_KEYS.POSTS, posts);
      return { liked, count: post.likesCount };
    },

    addComment: function (postId, commentText, authorName) {
      const text = cleanText(commentText, 500);
      if (!text) return null;

      const posts = loadJSON(STORAGE_KEYS.POSTS, DEFAULT_POSTS);
      const post = posts.find(p => p.id === postId);
      if (!post) return null;

      const user = this.getCurrentUser();
      const adm = this.isAdminSession();
      const override = adm && authorName;
      const author = cleanText(override ? authorName : (user ? user.name : authorName), 60) || 'عضو';
      if (!Array.isArray(post.comments)) post.comments = [];

      const comment = {
        id: uid('comm_'),
        author: author,
        avatar: cleanText((!override && user && user.avatar) ? user.avatar : author.charAt(0).toUpperCase(), 4),
        text: text,
        time: 'الآن',
        timestamp: Date.now()
      };

      post.comments.push(comment);
      saveJSON(STORAGE_KEYS.POSTS, posts);
      return comment;
    },

    togglePinPost: function (postId) {
      if (!this._requireAdmin()) return false;
      const posts = loadJSON(STORAGE_KEYS.POSTS, DEFAULT_POSTS);
      const post = posts.find(p => p.id === postId);
      if (post) {
        post.pinned = !post.pinned;
        saveJSON(STORAGE_KEYS.POSTS, posts);
        return post.pinned;
      }
      return false;
    },

    // ----------------- LIVE DISCUSSIONS (مناقشات الأعضاء المباشرة) -----------------
    getDiscussions: function () {
      const list = loadJSON(STORAGE_KEYS.DISCUSSIONS, DEFAULT_DISCUSSIONS);
      return list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    },

    // `trusted` is used only internally for system announcements
    addDiscussionMessage: function (msgData, trusted) {
      msgData = msgData || {};
      const text = cleanText(msgData.text, 1000);
      if (!text) return null;

      const discussions = loadJSON(STORAGE_KEYS.DISCUSSIONS, DEFAULT_DISCUSSIONS);
      const user = this.getCurrentUser();
      const custom = !!trusted || this.isAdminSession();

      const baseName = user ? user.name : (msgData.sender || 'عضو');
      const sender = cleanText(custom && msgData.sender ? msgData.sender : baseName, 60) || 'عضو';
      const baseAvatar = user ? (user.avatar || sender.charAt(0).toUpperCase()) : (msgData.senderAvatar || sender.charAt(0).toUpperCase());
      const baseRole = user ? (user.role || 'عضو') : (msgData.role || 'عضو');

      const newMsg = {
        id: uid('disc_'),
        sender: sender,
        senderAvatar: cleanText(custom && msgData.senderAvatar ? msgData.senderAvatar : baseAvatar, 4),
        role: cleanText(custom && msgData.role ? msgData.role : baseRole, 40) || 'عضو',
        text: text,
        time: 'الآن',
        timestamp: Date.now(),
        replyTo: msgData.replyTo ? cleanText(msgData.replyTo, 60) : null
      };

      discussions.push(newMsg);
      saveJSON(STORAGE_KEYS.DISCUSSIONS, discussions);
      return newMsg;
    },

    deleteDiscussionMessage: function (msgId) {
      if (!this._requireAdmin()) return false;
      let discussions = loadJSON(STORAGE_KEYS.DISCUSSIONS, DEFAULT_DISCUSSIONS);
      discussions = discussions.filter(d => d.id !== msgId);
      saveJSON(STORAGE_KEYS.DISCUSSIONS, discussions);
      return true;
    },

    // ----------------- TOPICS -----------------
    getTopics: function () {
      return loadJSON(STORAGE_KEYS.TOPICS, DEFAULT_TOPICS);
    },

    addTopic: function (icon, name) {
      if (!this._requireAdmin()) return null;
      const cleanName = cleanText(name, 40);
      if (!cleanName) return null;
      const topics = loadJSON(STORAGE_KEYS.TOPICS, DEFAULT_TOPICS);
      const newTopic = {
        id: uid('top_'),
        icon: cleanText(icon, 8) || '💡',
        name: cleanName,
        count: 0
      };
      topics.push(newTopic);
      saveJSON(STORAGE_KEYS.TOPICS, topics);
      return newTopic;
    },

    deleteTopic: function (topicId) {
      if (!this._requireAdmin()) return false;
      let topics = loadJSON(STORAGE_KEYS.TOPICS, DEFAULT_TOPICS);
      topics = topics.filter(t => t.id !== topicId);
      saveJSON(STORAGE_KEYS.TOPICS, topics);
      return true;
    },

    incrementTopicCount: function (topicName) {
      const topics = loadJSON(STORAGE_KEYS.TOPICS, DEFAULT_TOPICS);
      const topic = topics.find(t => t.name === topicName);
      if (topic) {
        topic.count = (topic.count || 0) + 1;
        saveJSON(STORAGE_KEYS.TOPICS, topics);
      }
    },

    // ----------------- MEMBERS (بطاقات الأعضاء الغنية) -----------------
    getMembers: function () {
      return loadJSON(STORAGE_KEYS.MEMBERS, DEFAULT_MEMBERS);
    },

    getMemberById: function (id) {
      const members = this.getMembers();
      return members.find(m => m.id === id || m.name === id);
    },

    addMember: function (name, role, specialty, bio) {
      if (!this._requireAdmin()) return null;
      const cleanName = cleanText(name, 40);
      if (!cleanName) return null;
      const members = loadJSON(STORAGE_KEYS.MEMBERS, DEFAULT_MEMBERS);
      const newMember = {
        id: uid('m_'),
        name: cleanName,
        avatar: cleanName.charAt(0).toUpperCase(),
        role: cleanText(role, 40) || 'عضو',
        specialty: cleanText(specialty, 80) || 'تقنية المعلومات والبرمجة',
        bio: cleanText(bio, 200) || 'عضو في مجتمع KALI COMMUNITY للتعلّم وتبادل المعرفة التقنية.',
        contributionsCount: 1,
        isOnline: true
      };
      members.push(newMember);
      saveJSON(STORAGE_KEYS.MEMBERS, members);
      return newMember;
    },

    deleteMember: function (memberId) {
      if (!this._requireAdmin()) return false;
      let members = loadJSON(STORAGE_KEYS.MEMBERS, DEFAULT_MEMBERS);
      members = members.filter(m => m.id !== memberId);
      saveJSON(STORAGE_KEYS.MEMBERS, members);
      return true;
    },

    // ----------------- STATS -----------------
    getStats: function () {
      return loadJSON(STORAGE_KEYS.STATS, DEFAULT_STATS);
    },

    updateStats: function (newStats) {
      if (!this._requireAdmin()) return this.getStats();
      const safe = {};
      ['membersCount', 'topicsCount', 'uptime'].forEach(k => {
        if (newStats && newStats[k] !== undefined) safe[k] = cleanText(newStats[k], 20);
      });
      const stats = { ...this.getStats(), ...safe };
      saveJSON(STORAGE_KEYS.STATS, stats);
      return stats;
    },

    // ----------------- USER AUTH & SETTINGS -----------------
    getCurrentUser: function () {
      return loadJSON(STORAGE_KEYS.USER, null);
    },

    setCurrentUser: function (user) {
      saveJSON(STORAGE_KEYS.USER, user);
      return user;
    },

    logout: function () {
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.dispatchEvent(new CustomEvent('kali_user_changed'));
    },

    registerGhostMember: function (name, specialty, bio) {
      const cleanName = cleanText(name, 40).replace(/\s+/g, ' ');
      if (cleanName.length < 2) return null;

      const members = loadJSON(STORAGE_KEYS.MEMBERS, DEFAULT_MEMBERS);
      let member = members.find(m => String(m.name).toLowerCase() === cleanName.toLowerCase());

      // Block impersonation: built-in members, "admin" names and the system sender are reserved
      if ((member && member.team !== 'ghost') || /admin|نظام تيم/i.test(cleanName)) return null;

      // Nobody becomes admin by typing a name. Admin rights only come from the authenticated admin panel.
      const role = 'عضو في تيم الشبح 👻';
      const spec = cleanText(specialty, 80) || 'عضو نخبة في تيم الشبح (الأمن والتقنية)';
      const bioText = cleanText(bio, 200) || 'عضو رسمي في تيم الشبح (Ghost Team) انضم عبر رابط التسجيل المباشر.';

      if (member) {
        member.role = role;
        member.specialty = spec;
        member.isOnline = true;
        member.team = 'ghost';
      } else {
        member = {
          id: uid('m_'),
          name: cleanName,
          avatar: cleanName.charAt(0).toUpperCase(),
          role: role,
          specialty: spec,
          bio: bioText,
          contributionsCount: 1,
          isOnline: true,
          team: 'ghost'
        };
        members.push(member);
      }
      saveJSON(STORAGE_KEYS.MEMBERS, members);

      const currentUser = {
        id: member.id,
        name: cleanName,
        avatar: member.avatar,
        role: role,
        specialty: spec,
        team: 'ghost',
        isAdmin: false
      };
      this.setCurrentUser(currentUser);

      // Automated announcement into discussions stream
      this.addDiscussionMessage({
        sender: 'نظام تيم الشبح ⚡',
        senderAvatar: '👻',
        role: 'إشعار انضمام رسمي',
        text: `👻 مرحباً بك يا ${cleanName} في تيم الشبح! انضم إلينا بطل جديد في الفريق التقني.`
      }, true);

      window.dispatchEvent(new CustomEvent('kali_user_joined_ghost', { detail: { user: currentUser } }));
      return currentUser;
    },

    getGhostInviteLink: function () {
      const origin = window.location.origin || '';
      const path = window.location.pathname || '';
      const folder = path.substring(0, path.lastIndexOf('/') + 1);
      return `${origin}${folder}join.html`;
    },

    getGhostParamLink: function () {
      const origin = window.location.origin || '';
      const path = window.location.pathname || '';
      const folder = path.substring(0, path.lastIndexOf('/') + 1);
      return `${origin}${folder}index.html?join=ghost`;
    },

    getSettings: function () {
      return loadJSON(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    },

    updateSettings: function (newSettings) {
      if (!this._requireAdmin()) return this.getSettings();
      const safe = sanitizeObject(newSettings || {});
      // The password can only change through changeAdminPassword()
      delete safe.adminPassword;
      delete safe.adminPasswordHash;
      const settings = { ...this.getSettings(), ...safe };
      saveJSON(STORAGE_KEYS.SETTINGS, settings);
      return settings;
    },

    // Secure SHA-256 Hashing helper
    hashPassword: async function (str) {
      if (window.crypto && window.crypto.subtle) {
        const msgBuffer = new TextEncoder().encode(str);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
      // Fallback synchronous bitwise hash
      let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
      for (let i = 0; i < str.length; i++) {
        const ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
      }
      h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
      h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
      return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
    },

    // Cryptographic Session Token Engine
    createSessionToken: async function () {
      const token = randomHex(32);
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ t: token, exp: Date.now() + ADMIN_SESSION_MS }));
      } catch (e) {}
      return token;
    },

    verifySessionToken: async function (token) {
      try {
        const s = JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY) || 'null');
        if (token && typeof token === 'string' && s && safeEqual(token, s.t) && s.exp > Date.now()) return true;
      } catch (e) {}
      this.endAdminSession();
      return false;
    },

    isAdminSession: function () {
      try {
        const s = JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY) || 'null');
        return !!(s && s.t && s.exp > Date.now());
      } catch (e) {
        return false;
      }
    },

    endAdminSession: function () {
      try { sessionStorage.removeItem(ADMIN_SESSION_KEY); } catch (e) {}
    },

    _requireAdmin: function () {
      if (this.isAdminSession()) return true;
      console.warn('[KALI_DB] Operation requires an authenticated admin session.');
      return false;
    },

    getLoginLockSeconds: function () {
      const g = readLoginGuard();
      return Math.max(0, Math.ceil((g.until - Date.now()) / 1000));
    },

    verifyAdminPassword: async function (password) {
      if (!password || typeof password !== 'string') return false;
      if (this.getLoginLockSeconds() > 0) return false;

      const clean = password.trim();
      const settings = this.getSettings();
      const stored = String(settings.adminPasswordHash || DEFAULT_SETTINGS.adminPasswordHash);
      const canPbkdf2 = !!(window.crypto && window.crypto.subtle);
      let ok = false;

      if (stored.indexOf('pbkdf2$') === 0) {
        const p = stored.split('$');
        if (p.length === 4 && canPbkdf2) {
          const iter = Math.min(Math.max(parseInt(p[1], 10) || PBKDF2_ITERATIONS, 10000), 1000000);
          ok = safeEqual(await pbkdf2Hex(clean, p[2], iter), p[3]);
        }
      } else {
        // Legacy unsalted SHA-256 hash: verify, then upgrade it silently to salted PBKDF2
        ok = safeEqual(await this.hashPassword(clean), stored);
        if (ok && canPbkdf2) {
          try {
            const s = this.getSettings();
            s.adminPasswordHash = await this.makePasswordRecord(clean);
            saveJSON(STORAGE_KEYS.SETTINGS, s);
          } catch (e) {}
        }
      }

      // Persistent brute-force protection (survives page reloads)
      const g = readLoginGuard();
      if (ok) {
        writeLoginGuard({ fails: 0, until: 0, level: 0 });
      } else {
        g.fails += 1;
        if (g.fails >= 5) {
          g.level += 1;
          g.fails = 0;
          g.until = Date.now() + Math.min(30000 * Math.pow(2, g.level - 1), 15 * 60 * 1000);
        }
        writeLoginGuard(g);
      }
      return ok;
    },

    makePasswordRecord: async function (clean) {
      if (window.crypto && window.crypto.subtle) {
        const salt = randomHex(16);
        const h = await pbkdf2Hex(clean, salt, PBKDF2_ITERATIONS);
        return `pbkdf2$${PBKDF2_ITERATIONS}$${salt}$${h}`;
      }
      return await this.hashPassword(clean);
    },

    // No hard-coded recovery keys: the only way to set a new password is to know the current one
    resetAdminPassword: async function (oldPass, newPass) {
      if (!newPass || newPass.trim().length < 8) {
        return { success: false, message: 'كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف' };
      }
      if (this.getLoginLockSeconds() > 0) {
        return { success: false, message: 'محاولات كثيرة خاطئة. انتظر قليلاً ثم أعد المحاولة.' };
      }
      const ok = await this.verifyAdminPassword((oldPass || '').trim());
      if (!ok) {
        return { success: false, message: 'كلمة المرور القديمة غير صحيحة!' };
      }
      await this.changeAdminPassword(newPass);
      return { success: true, message: 'تمت إعادة تعيين كلمة المرور بنجاح!' };
    },

    changeAdminPassword: async function (newPassword) {
      const clean = (newPassword || '').trim();
      if (clean.length < 8) return false;
      const settings = this.getSettings();
      settings.adminPasswordHash = await this.makePasswordRecord(clean);
      delete settings.adminPassword; // Purge plain text
      saveJSON(STORAGE_KEYS.SETTINGS, settings);
      return true;
    },

    // ----------------- BACKUP & RESTORE -----------------
    exportDataJSON: function () {
      const dump = {
        posts: this.getPosts(),
        discussions: this.getDiscussions(),
        topics: this.getTopics(),
        members: this.getMembers(),
        stats: this.getStats(),
        settings: (() => {
          const s = { ...this.getSettings() };
          delete s.adminPassword;
          delete s.adminPasswordHash;
          return s;
        })(),
        exportedAt: new Date().toISOString()
      };
      return JSON.stringify(dump, null, 2);
    },

    importDataJSON: function (jsonStr) {
      if (!this._requireAdmin()) return false;
      try {
        if (typeof jsonStr !== 'string' || jsonStr.length > 5 * 1024 * 1024) return false;
        const parsed = sanitizeObject(JSON.parse(jsonStr));
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;

        const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
        // Every list must contain objects with the fields the UI relies on
        const shapes = {
          posts: ['id', 'author', 'content'],
          discussions: ['id', 'sender', 'text'],
          topics: ['id', 'name'],
          members: ['id', 'name']
        };
        for (const key of Object.keys(shapes)) {
          if (parsed[key] === undefined) continue;
          if (!Array.isArray(parsed[key])) return false;
          const bad = parsed[key].some(item => !isObj(item) || shapes[key].some(f => typeof item[f] !== 'string'));
          if (bad) return false;
        }
        if (parsed.stats !== undefined && !isObj(parsed.stats)) return false;
        if (parsed.settings !== undefined && !isObj(parsed.settings)) return false;

        if (parsed.posts) saveJSON(STORAGE_KEYS.POSTS, parsed.posts);
        if (parsed.discussions) saveJSON(STORAGE_KEYS.DISCUSSIONS, parsed.discussions);
        if (parsed.topics) saveJSON(STORAGE_KEYS.TOPICS, parsed.topics);
        if (parsed.members) saveJSON(STORAGE_KEYS.MEMBERS, parsed.members);
        if (parsed.stats) saveJSON(STORAGE_KEYS.STATS, parsed.stats);
        if (parsed.settings) {
          // An imported file must never be able to overwrite the admin password
          const s = { ...parsed.settings };
          delete s.adminPassword;
          delete s.adminPasswordHash;
          saveJSON(STORAGE_KEYS.SETTINGS, { ...this.getSettings(), ...s });
        }
        return true;
      } catch (e) {
        console.error('Import error:', e);
        return false;
      }
    },

    resetToDefault: function () {
      if (!this._requireAdmin()) return false;
      saveJSON(STORAGE_KEYS.POSTS, DEFAULT_POSTS);
      saveJSON(STORAGE_KEYS.DISCUSSIONS, DEFAULT_DISCUSSIONS);
      saveJSON(STORAGE_KEYS.TOPICS, DEFAULT_TOPICS);
      saveJSON(STORAGE_KEYS.MEMBERS, DEFAULT_MEMBERS);
      saveJSON(STORAGE_KEYS.STATS, DEFAULT_STATS);
      // Keep the current admin password: resetting content must not reset credentials
      const keep = this.getSettings();
      saveJSON(STORAGE_KEYS.SETTINGS, { ...DEFAULT_SETTINGS, adminPasswordHash: keep.adminPasswordHash || DEFAULT_SETTINGS.adminPasswordHash });
      return true;
    }
  };

  DB.init();
  window.KALI_DB = DB;

})(window);
