import React from 'react';
import { User, Shield, Bell, Globe, Save, LogOut } from 'lucide-react';
import { useFirebase } from '../FirebaseContext';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function SettingsView() {
  const { appUser, user, logout } = useFirebase();
  const [formData, setFormData] = React.useState(appUser || { name: '', role: '', office: '', country: '' });
  const [saving, setSaving] = React.useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const { email, ...updateData } = formData as any;
      await updateDoc(userRef, { ...updateData });
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl p-8 border border-dawn shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-citrus/10 rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-citrus" />
          </div>
          <div>
            <h2 className="text-xl font-black text-ink">Account Settings</h2>
            <p className="text-sm text-muted">Manage your identity and regional preferences.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-stone/50 border border-dawn rounded-xl px-4 py-3 text-sm font-bold focus:border-citrus outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Role</label>
              <input 
                type="text" 
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-stone/50 border border-dawn rounded-xl px-4 py-3 text-sm font-bold focus:border-citrus outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Active Hub</label>
              <input 
                type="text" 
                value={formData.office}
                onChange={e => setFormData({ ...formData, office: e.target.value })}
                className="w-full bg-stone/50 border border-dawn rounded-xl px-4 py-3 text-sm font-bold focus:border-citrus outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Country</label>
              <input 
                type="text" 
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                className="w-full bg-stone/50 border border-dawn rounded-xl px-4 py-3 text-sm font-bold focus:border-citrus outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button 
              type="button" 
              onClick={logout}
              className="flex items-center gap-2 text-red-500 font-bold text-sm hover:opacity-80"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            <button 
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-ink text-white rounded-xl text-sm font-bold hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-dawn shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <Shield className="w-5 h-5 text-muted" />
          <h3 className="font-bold text-ink">System Information</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm py-2 border-b border-stone">
            <span className="text-muted">Cloud Infrastructure</span>
            <span className="font-bold">Firebase (GCP)</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b border-stone">
            <span className="text-muted">Database Region</span>
            <span className="font-bold">europe-west2</span>
          </div>
          <div className="flex justify-between text-sm py-2">
            <span className="text-muted">Auth Identity</span>
            <span className="font-bold">{user?.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
