import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { Share2, Plus, MessageSquare, ThumbsUp, Sparkles, Send, MapPin, Award, Shield, User, RefreshCw } from 'lucide-react';

interface Post {
  id: string;
  authorName: string;
  authorEmail?: string;
  habitTitle: string;
  category: 'transport' | 'food' | 'home' | 'shopping' | 'waste' | 'general';
  impactKg: number;
  content: string;
  likes: number;
  createdAt: string;
}

const SEED_COMMUNITY_POSTS: Post[] = [
  {
    id: 'seed-post-1',
    authorName: 'Siddharth Roy',
    habitTitle: 'Zero-Emission Bicycle Commute',
    category: 'transport',
    impactKg: 14.5,
    content: 'Completed a full week of commuting via bicycle instead of driving single passenger. It is 15 miles total but the fresh air and knowing 14 kg of CO₂ was saved is highly therapeutic! 🚲🌱',
    likes: 24,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'seed-post-2',
    authorName: 'Emma Watson',
    habitTitle: 'All Plant-Based Dinner Party',
    category: 'food',
    impactKg: 8.2,
    content: 'Hosted a fully organic, plant-based dinner for six friends! We served lentil shepherd\'s pie and raspberry avocado mousse. Nobody missed the beef, and several friends asked for the recipes! 🍲🥕',
    likes: 18,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'seed-post-3',
    authorName: 'Akira Tanaka',
    habitTitle: 'Installed smart home energy thermostats',
    category: 'home',
    impactKg: 32.0,
    content: 'Finally mounted digital smart grids. Programmable temperature offset decreases load by 15% when out of house. Incredible baseline optimization! ⚡💾',
    likes: 15,
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString()
  }
];

export const CommunityFeed: React.FC = () => {
  const { firebaseUser, user } = useApp();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Form State
  const [habitTitle, setHabitTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'transport' | 'food' | 'home' | 'shopping' | 'waste' | 'general'>('general');
  const [impactKg, setImpactKg] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetched: Post[] = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as Post);
      });

      if (fetched.length === 0) {
        // Fallback to seeded posts if database has no records
        setPosts(SEED_COMMUNITY_POSTS);
      } else {
        setPosts(fetched);
      }
    } catch (e) {
      console.error("Firestore read failed, falling back to seed data:", e);
      setPosts(SEED_COMMUNITY_POSTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId: string) => {
    if (likedPosts.includes(postId)) return;

    setLikedPosts(prev => [...prev, postId]);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));

    try {
      const docRef = doc(db, 'posts', postId);
      await updateDoc(docRef, {
        likes: increment(1)
      });
    } catch (e) {
      console.warn("Could not sync like to Cloud Firestore:", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim() || !content.trim()) return;

    setSubmitting(true);
    const authorName = firebaseUser?.displayName || user?.name || 'Sustainable Guardian';
    const authorEmail = firebaseUser?.email || 'guest@earth.org';

    const newPostData = {
      authorName,
      authorEmail,
      habitTitle: habitTitle.trim(),
      category,
      impactKg: Number(impactKg) || 0,
      content: content.trim(),
      likes: 0,
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, 'posts'), newPostData);
      const newPost: Post = {
        id: docRef.id,
        ...newPostData
      };
      setPosts(prev => [newPost, ...prev]);
      
      // Reset form
      setHabitTitle('');
      setContent('');
      setCategory('general');
      setImpactKg(5);
      setShowCreate(false);
    } catch (err) {
      console.error("Error creating post on Firebase:", err);
      // Fallback local add so user can see it instantly
      const localPost: Post = {
        id: 'local-' + Date.now(),
        ...newPostData
      };
      setPosts(prev => [localPost, ...prev]);
      setHabitTitle('');
      setContent('');
      setCategory('general');
      setImpactKg(5);
      setShowCreate(false);
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'transport': return 'from-amber-500 to-orange-600 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400';
      case 'food': return 'from-emerald-500 to-green-600 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400';
      case 'home': return 'from-cyan-500 to-blue-600 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400';
      case 'shopping': return 'from-purple-500 to-indigo-600 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400';
      case 'waste': return 'from-teal-500 to-forest-600 bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400';
      default: return 'from-stone-500 to-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300';
    }
  };

  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case 'transport': return '🚲';
      case 'food': return '🌱';
      case 'home': return '🔌';
      case 'shopping': return '🛍️';
      case 'waste': return '♻️';
      default: return '🌍';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header and Callout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200/60 pb-5 dark:border-stone-850">
        <div>
          <h1 className="font-display font-bold text-3xl tracking-tight text-stone-900 dark:text-stone-50">
            Community Green Share
          </h1>
          <p className="text-sm text-stone-450 mt-1">
            Browse, discuss, and celebrate active decarbonization habits shared by global citizens.
          </p>
        </div>
        
        <button
          id="btn-community-open-create"
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs shadow-md shadow-forest-600/10 cursor-pointer transition-transform duration-250 active:scale-[0.98]"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Post My Achievement</span>
        </button>
      </div>

      {/* Cloud awareness notification bar */}
      {!firebaseUser && (
        <div className="p-3 bg-amber-50/70 border border-amber-200/50 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 dark:bg-amber-950/10 dark:border-amber-900/20 dark:text-amber-400">
          <Shield className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Guest Mode Warning:</span> You are currently offline. Connect your account in <button type="button" onClick={() => {}} className="font-bold underline">Settings</button> to back up your habits and share achievements with the real live feed!
          </div>
        </div>
      )}

      {/* Create Achievement form Drawer/Panel */}
      {showCreate && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-lg dark:border-stone-850 dark:bg-stone-900 animate-slide-up">
          <h2 className="font-display font-bold text-base text-stone-900 dark:text-stone-50 flex items-center gap-1.5 mb-4">
            <Sparkles className="h-4.5 w-4.5 text-forest-500 animate-bounce" />
            <span>Broadcast Your Eco Achievement</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-stone-500 dark:text-stone-400 uppercase">Interactive Habit Title</label>
                <input
                  id="post-form-title"
                  type="text"
                  required
                  placeholder="e.g. Switched entire apartment to LED spotlights"
                  value={habitTitle}
                  onChange={(e) => setHabitTitle(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 dark:bg-stone-950 dark:border-stone-800 dark:text-stone-50 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-500 dark:text-stone-400 uppercase">Impact Sector</label>
                <select
                  id="post-form-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 dark:bg-stone-950 dark:border-stone-800 dark:text-stone-50 focus:outline-hidden"
                >
                  <option value="transport">🚲 Commutes & Mobility</option>
                  <option value="food">🌱 Clean Plant-based Foods</option>
                  <option value="home">🔌 Heating & Energy Conservation</option>
                  <option value="shopping">🛍️ Conscious Sourcing</option>
                  <option value="waste">♻️ Composting & Upcycling</option>
                  <option value="general">🌍 General Activism</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 md:col-span-1">
                <label className="font-bold text-stone-500 dark:text-stone-400 uppercase">Estimated CO₂ Saved (kg)</label>
                <input
                  id="post-form-impact"
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={impactKg}
                  onChange={(e) => setImpactKg(Number(e.target.value))}
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 dark:bg-stone-950 dark:border-stone-800 dark:text-stone-50 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-stone-500 dark:text-stone-400 uppercase">Your Story</label>
                <textarea
                  id="post-form-content"
                  required
                  rows={3}
                  placeholder="Share details on how you pulled this off, tips for others, and how satisfying it feels."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 dark:bg-stone-950 dark:border-stone-800 dark:text-stone-50 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-stone-850 flex justify-end gap-2">
              <button
                id="btn-community-cancel"
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-lg hover:bg-stone-100 text-stone-500 dark:text-stone-400 font-bold"
              >
                Cancel
              </button>
              <button
                id="btn-community-post-submit"
                type="submit"
                disabled={submitting}
                className="flex items-center space-x-1 px-5 py-2 rounded-lg bg-forest-600 hover:bg-forest-700 text-white font-bold shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{submitting ? "Broadcasting..." : "Broadcast Story"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feed List */}
      <div className="space-y-5">
        {loading ? (
          <div className="py-20 text-center text-stone-400">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-forest-500" />
            <p className="font-sans text-xs font-semibold">Reading live stories from Cloud Firestore...</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="group rounded-2xl border border-stone-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-250 dark:border-stone-850 dark:bg-stone-900 hover:scale-[1.005]"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-600 dark:bg-forest-950/30 dark:border-forest-900/30">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {post.authorName}
                    </h3>
                    <p className="text-[10px] text-stone-400 font-mono">
                      {new Date(post.createdAt).toLocaleDateString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 bg-gradient-to-r ${getCategoryColor(post.category)}`}>
                  <span>{getCategoryEmoji(post.category)}</span>
                  <span className="capitalize">{post.category}</span>
                </div>
              </div>

              {/* Central post info */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-sm text-stone-850 dark:text-stone-50">
                    {post.habitTitle}
                  </span>
                  <div className="flex items-center gap-0.5 rounded-md bg-emerald-100/40 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 px-1.5 py-0.2 font-mono text-[10px] font-bold">
                    <Award className="h-3 w-3 text-emerald-500" />
                    <span>-{post.impactKg} kg CO₂</span>
                  </div>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed dark:text-stone-300 font-sans">
                  {post.content}
                </p>
              </div>

              {/* Bottom interaction controls */}
              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-850 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-1.5 text-xs font-bold transition-colors select-none ${likedPosts.includes(post.id) ? 'text-forest-600 dark:text-forest-400' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`}
                  >
                    <ThumbsUp className={`h-4 w-4 ${likedPosts.includes(post.id) ? 'fill-forest-600 text-forest-600 dark:fill-forest-400' : ''}`} />
                    <span>{post.likes}</span>
                  </button>
                  <div className="flex items-center space-x-1 text-xs text-stone-400">
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-bold">Inspired</span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-stone-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  ID: {post.id.slice(0, 8)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
