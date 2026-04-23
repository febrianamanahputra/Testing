import { useState } from 'react';
import { Workspace } from '../types';
import { db, auth } from '../firebase';
import { doc, getDocs, collection, query, where, writeBatch, serverTimestamp } from 'firebase/firestore';
import { X, Users, Mail, UserPlus, Shield } from 'lucide-react';
import { handleFirestoreError } from '../utils/firestore-error';

interface TeamModalProps {
  workspace: Workspace | null;
  onClose: () => void;
}

export function TeamModal({ workspace, onClose }: TeamModalProps) {
  const [emailToInvite, setEmailToInvite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!workspace || !auth.currentUser) return null;

  const isOwner = workspace.ownerId === auth.currentUser.uid;

  const handleUpdateTeam = async (newAclEmails: string[]) => {
    setLoading(true);
    setError('');
    try {
      const batch = writeBatch(db);

      // 1. Update workspace
      const wsRef = doc(db, 'workspaces', workspace.id);
      batch.set(wsRef, {
        aclEmails: newAclEmails,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 2. Fetch all materials in this workspace and update them
      const qMat = query(collection(db, 'materials'), where('workspaceId', '==', workspace.id));
      const matSnapshot = await getDocs(qMat);

      for (const materialDoc of matSnapshot.docs) {
        batch.set(materialDoc.ref, {
          aclEmails: newAclEmails,
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Note: For a true enterprise system, you'd ALSO update all History docs within each Material here, 
        // using further queries. Since Firebase batches have 500 max writes, and for a demo, 
        // we're limiting scope. The user will be blocked entirely at the Material level anyway.
      }

      await batch.commit();
      setEmailToInvite('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update team.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailToInvite.trim().toLowerCase();
    
    if (!cleanEmail || workspace.aclEmails.includes(cleanEmail)) {
      setEmailToInvite('');
      return;
    }

    if (workspace.aclEmails.length >= 20) {
      setError("Maximum of 20 team members allowed in this demo.");
      return;
    }

    const newAclEmails = [...workspace.aclEmails, cleanEmail];
    await handleUpdateTeam(newAclEmails);
  };

  const handleRemoveMember = async (emailToRemove: string) => {
    if (emailToRemove === auth.currentUser?.email) {
      setError("Cannot remove yourself. Contact admin to leave workspace.");
      return;
    }
    const newAclEmails = workspace.aclEmails.filter(e => e !== emailToRemove);
    await handleUpdateTeam(newAclEmails);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users className="text-blue-600" size={20} />
            <h2 className="text-xl font-semibold text-slate-800">Team Workspace</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3 text-sm text-blue-800">
            <Shield className="shrink-0 mt-0.5" size={16} />
            <p><strong>{workspace.name}</strong><br />Materials created here are isolated and only visible to the members listed below.</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Team Members ({workspace.aclEmails.length}/20)</h3>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {workspace.aclEmails.map(email => (
                <li key={email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" />
                    {email}
                  </span>
                  {isOwner && email !== auth.currentUser?.email && (
                    <button 
                      onClick={() => handleRemoveMember(email)}
                      disabled={loading}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                  {email === auth.currentUser?.email && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-100 px-2 py-0.5 rounded mr-1">You</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {isOwner && (
            <form onSubmit={handleAddMember} className="mt-6 pt-6 border-t border-gray-100">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Invite New Member</label>
              {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
              <div className="flex gap-2">
                <input 
                  type="email" 
                  required
                  placeholder="colleague@example.com"
                  className="flex-1 px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={emailToInvite}
                  onChange={(e) => setEmailToInvite(e.target.value)}
                  disabled={loading}
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-colors text-sm font-semibold"
                >
                  <UserPlus size={16} />
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          )}

          {!isOwner && (
             <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-slate-400">
               Only the workspace owner can manage team members.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
