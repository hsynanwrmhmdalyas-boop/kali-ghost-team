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

  const APP_VERSION = '2026.11.24.3';
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
    adminPasswordHash: '576abd4742653e99eceb205e09dc5ee8c06d527ad74d58e82e5a9d73fb1b83d5', // SHA-256 for KAIi 2027

    siteTitle: 'KALI COMMUNITY',
    heroNotice: 'مجتمع التقنية والأمن السيبراني',
    allowGuestPosting: true,
    firebaseConfig: null,
    ghostWelcomeMessage: 'مرحباً بك في تيم الشباح',
    ghostWelcomeSubtext: 'تم تفعيل هويتك الرقمية بنجاح كعضو رسمي في تيم الشباح بقيادة KALI HUSSEIN.'
  };

  function loadJSON(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
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
        
                // Upgrade old kali2026 to new KAIi 2027
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
      const posts = loadJSON(STORAGE_KEYS.POSTS, DEFAULT_POSTS);
      const user = this.getCurrentUser() || { name: 'عضو جديد', avatar: 'U', role: 'عضو' };

      const newPost = {
        id: 'post_' + Date.now(),
        author: postData.author || user.name,
        authorAvatar: postData.authorAvatar || user.avatar || user.name.charAt(0).toUpperCase(),
        role: postData.role || user.role || 'عضو',
        topicTag: postData.topicTag || 'نقاش عام',
        content: postData.content,
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
      const posts = loadJSON(STORAGE_KEYS.POSTS, DEFAULT_POSTS);
      const post = posts.find(p => p.id === postId);
      if (!post) return null;

      const user = this.getCurrentUser() || { name: authorName || 'عضو', avatar: 'U' };
      if (!Array.isArray(post.comments)) post.comments = [];

      const comment = {
        id: 'comm_' + Date.now(),
        author: authorName || user.name,
        avatar: user.avatar || (authorName ? authorName.charAt(0).toUpperCase() : 'U'),
        text: commentText,
        time: 'الآن',
        timestamp: Date.now()
      };

      post.comments.push(comment);
      saveJSON(STORAGE_KEYS.POSTS, posts);
      return comment;
    },

    togglePinPost: function (postId) {
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

    addDiscussionMessage: function (msgData) {
      const discussions = loadJSON(STORAGE_KEYS.DISCUSSIONS, DEFAULT_DISCUSSIONS);
      const user = this.getCurrentUser() || { name: 'عضو', avatar: 'U', role: 'عضو' };

      const newMsg = {
        id: 'disc_' + Date.now(),
        sender: msgData.sender || user.name,
        senderAvatar: msgData.senderAvatar || user.avatar || user.name.charAt(0).toUpperCase(),
        role: msgData.role || user.role || 'عضو',
        text: msgData.text,
        time: 'الآن',
        timestamp: Date.now(),
        replyTo: msgData.replyTo || null
      };

      discussions.push(newMsg);
      saveJSON(STORAGE_KEYS.DISCUSSIONS, discussions);
      return newMsg;
    },

    deleteDiscussionMessage: function (msgId) {
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
      const topics = loadJSON(STORAGE_KEYS.TOPICS, DEFAULT_TOPICS);
      const newTopic = {
        id: 'top_' + Date.now(),
        icon: icon || '💡',
        name: name,
        count: 0
      };
      topics.push(newTopic);
      saveJSON(STORAGE_KEYS.TOPICS, topics);
      return newTopic;
    },

    deleteTopic: function (topicId) {
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
      const members = loadJSON(STORAGE_KEYS.MEMBERS, DEFAULT_MEMBERS);
      const newMember = {
        id: 'm_' + Date.now(),
        name: name,
        avatar: name.charAt(0).toUpperCase(),
        role: role || 'عضو',
        specialty: specialty || 'تقنية المعلومات والبرمجة',
        bio: bio || 'عضو في مجتمع KALI COMMUNITY للتعلّم وتبادل المعرفة التقنية.',
        contributionsCount: 1,
        isOnline: true
      };
      members.push(newMember);
      saveJSON(STORAGE_KEYS.MEMBERS, members);
      return newMember;
    },

    deleteMember: function (memberId) {
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
      const stats = { ...this.getStats(), ...newStats };
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
      const cleanName = (name || '').trim();
      if (!cleanName) return null;

      const members = loadJSON(STORAGE_KEYS.MEMBERS, DEFAULT_MEMBERS);
      let member = members.find(m => m.name.toLowerCase() === cleanName.toLowerCase());

      const isFounder = cleanName.toLowerCase().includes('kali') || cleanName.includes('حسين');
      const role = isFounder ? 'مؤسس تيم الشباح' : 'عضو في تيم الشباح 👻';
      const spec = specialty || 'عضو نخبة في تيم الشباح (الأمن والتقنية)';
      const bioText = bio || 'عضو رسمي في تيم الشباح (Ghost Team) انضم عبر رابط التسجيل المباشر.';

      if (member) {
        member.role = role;
        member.specialty = spec;
        member.isOnline = true;
        member.team = 'ghost';
      } else {
        member = {
          id: 'm_' + Date.now(),
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
        isAdmin: isFounder
      };
      this.setCurrentUser(currentUser);

      // Automated announcement into discussions stream
      this.addDiscussionMessage({
        sender: 'نظام تيم الشباح ⚡',
        senderAvatar: '👻',
        role: 'إشعار انضمام رسمي',
        text: `👻 مرحباً بك يا ${cleanName} في تيم الشباح! انضم إلينا بطل جديد في الفريق التقني.`
      });

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
      const settings = { ...this.getSettings(), ...newSettings };
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
    createSessionToken: async function (password) {
      const clean = (password || '').trim();
      const hash = await this.hashPassword(clean);
      const salt = 'kali_ghost_secure_salt_9981';
      const today = new Date().toISOString().slice(0, 10);
      return await this.hashPassword(`${hash}:${salt}:${today}`);
    },

    verifySessionToken: async function (token) {
      if (!token || typeof token !== 'string' || token.length < 10) return false;
      const settings = this.getSettings();
      const salt = 'kali_ghost_secure_salt_9981';
      const today = new Date().toISOString().slice(0, 10);

      // Check against current settings password hash
      if (settings.adminPasswordHash) {
        const expectedToken = await this.hashPassword(`${settings.adminPasswordHash}:${salt}:${today}`);
        return token === expectedToken;
      }

      // Check against default kali2026 hash
      const defaultHash = 'a4b06341397774dacd1e23fdb6705b53e5901dba00cb3270feb0ec9e454a35e6';
      const expectedDefaultToken = await this.hashPassword(`${defaultHash}:${salt}:${today}`);
      return token === expectedDefaultToken;
    },

        verifyAdminPassword: async function (password) {
      if (!password) return false;
      const clean = password.trim();
      const hash = await this.hashPassword(clean);
      const settings = this.getSettings();

      // Check if matches custom saved hash
      if (settings.adminPasswordHash && hash === settings.adminPasswordHash) {
        return true;
      }

      // Check against KAIi 2027 variations and emergency/old passwords
      const allowedPlain = [
        'kai 2027', 'kaii 2027', 'kali 2027',
        'kai2027', 'kaii2027', 'kali2027',
        'kali2026', 'kaIi2026'
      ];
      const norm = clean.toLowerCase().replace(/i/g, 'l');
      const normDirect = clean.toLowerCase();

      if (allowedPlain.includes(normDirect) || allowedPlain.includes(norm) || clean === 'KAIi 2027' || clean === 'KAIi2027' || clean === 'KALI 2027' || clean === 'KALI2027') {
        return true;
      }

      // Check known SHA-256 hashes
      const knownHashes = [
        '576abd4742653e99eceb205e09dc5ee8c06d527ad74d58e82e5a9d73fb1b83d5', // KAIi 2027
        'b39e2027e60ba78cce8597079433c07617f998f3471e8f45ebec8d9f2f6fecd7', // KAIi2027
        '828cdf2971d70685b50fc2ef99f336d7ef72994d26a2570d34481810c8b5fb0f', // KALI 2027
        'e8f68fd88bcdcb02670f17fcafa38783fe683ffeb945cf38f9e042b0cdedd839', // KALI2027
        'ce577ec605422ebc15df0e103c6485f0e3763cf14b22fb89f4f1394d1671d5a5', // kali 2027
        '772e4e91750368e7e152a7a8f300547b9df7a39a933bc1f185e59197503a1643', // kali2027
        'a4b06341397774dacd1e23fdb6705b53e5901dba00cb3270feb0ec9e454a35e6'  // kali2026 (old)
      ];

      return knownHashes.includes(hash);
    },

    resetAdminPassword: async function (recoveryKeyOrOldPass, newPass) {
      if (!newPass || newPass.length < 6) {
        return { success: false, message: 'كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف' };
      }
      const cleanKey = (recoveryKeyOrOldPass || '').trim();
      const validRecoveryKeys = [
        'ghost2027', 'ghost-kali-2027', 'kali2026', 'kali2027', 'kai2027', 'kaii2027'
      ];
      const isKeyValid = validRecoveryKeys.includes(cleanKey.toLowerCase()) || await this.verifyAdminPassword(cleanKey);
      if (!isKeyValid) {
        return { success: false, message: 'رمز الاسترداد أو كلمة المرور القديمة غير صحيحة!' };
      }
      await this.changeAdminPassword(newPass);
      return { success: true, message: 'تمت إعادة تعيين كلمة المرور بنجاح!' };
    },

    changeAdminPassword: async function (newPassword) {
      if (!newPassword || newPassword.length < 6) return false;
      const clean = newPassword.trim();
      const hash = await this.hashPassword(clean);
      const settings = this.getSettings();
      settings.adminPasswordHash = hash;
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
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.posts) saveJSON(STORAGE_KEYS.POSTS, parsed.posts);
        if (parsed.discussions) saveJSON(STORAGE_KEYS.DISCUSSIONS, parsed.discussions);
        if (parsed.topics) saveJSON(STORAGE_KEYS.TOPICS, parsed.topics);
        if (parsed.members) saveJSON(STORAGE_KEYS.MEMBERS, parsed.members);
        if (parsed.stats) saveJSON(STORAGE_KEYS.STATS, parsed.stats);
        if (parsed.settings) saveJSON(STORAGE_KEYS.SETTINGS, parsed.settings);
        return true;
      } catch (e) {
        console.error('Import error:', e);
        return false;
      }
    },

    resetToDefault: function () {
      saveJSON(STORAGE_KEYS.POSTS, DEFAULT_POSTS);
      saveJSON(STORAGE_KEYS.DISCUSSIONS, DEFAULT_DISCUSSIONS);
      saveJSON(STORAGE_KEYS.TOPICS, DEFAULT_TOPICS);
      saveJSON(STORAGE_KEYS.MEMBERS, DEFAULT_MEMBERS);
      saveJSON(STORAGE_KEYS.STATS, DEFAULT_STATS);
      saveJSON(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      return true;
    }
  };

  DB.init();
  window.KALI_DB = DB;

})(window);
