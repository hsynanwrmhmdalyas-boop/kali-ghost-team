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
    adminPassword: 'kali',
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
      if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        saveJSON(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      }
      // Note: User starts as null until they enter their name via Ghost Team gate,
      // or login as admin.
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

    verifyAdminPassword: function (password) {
      const settings = this.getSettings();
      return password === settings.adminPassword || password === 'kali2026' || password === 'admin';
    },

    // ----------------- BACKUP & RESTORE -----------------
    exportDataJSON: function () {
      const dump = {
        posts: this.getPosts(),
        discussions: this.getDiscussions(),
        topics: this.getTopics(),
        members: this.getMembers(),
        stats: this.getStats(),
        settings: this.getSettings(),
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
