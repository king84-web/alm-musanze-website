
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { PublicLayout } from './components/PublicLayout';
import { ViewState, UserRole, Event, Member, Announcement, Transaction, Album, Feedback, LoginLog, Photo } from '../types';
import { MemberDashboard, MemberEvents, MemberProfile, MemberFinance, MemberGallery, MemberFeedback } from './views/MemberViews';
import { AdminDashboard, AdminMembers, AdminMemberProfile, AdminEvents, AdminFinance, AdminContent, AdminInbox } from './views/AdminViews';
import { PublicHome } from './views/PublicHome';
import { PublicAbout, PublicEvents, PublicGallery, PublicFinance, PublicLeaders, PublicContact } from './views/PublicPages';
import { LoginPage, RegisterPage } from './views/AuthPages';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@/src/components/Common';

import { useAlmStore, useCurrentUser, useIsMember } from '@/store/useAppStore';
import { useThemeStore } from '@/store/themeStore';
import EventsService from './libs/eventService';

export default function App() {
  const { events, setEvents, handleUpdateMember, members, handleDeleteFeedback, albums,
    handleReplyFeedback, photos, handleAddMember, handleAddTransaction,
    handleDeleteAnnouncement, transactions, handleDeleteMember, handleFeedbackSubmit,
    feedback, rsvpEventIds, handleToggleRsvp, role, fetchMembers, getMyProfile,
    setRsvpEventIds, currentUser, handleUpdateProfile, loading,
    announcements, handleLogin, handleUpdateEvent, handleArchiveFeedback,
    handleAddAnnouncement, loginLogs, setLoginLogs,
    handleRegister, toggleRole, handleNavigate,
    selectedMember, setSelectedMember, handleDeleteEvent,
    toast, currentView, setCurrentView, handleLogout, handleAddEvent, isMember, fetchCurrentUser: MyProfile } = useAlmStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    // const storedUser = localStorage.getItem('alm_user');
    // const storedRole = localStorage.getItem('alm_role');
    const storedLogs = localStorage.getItem('alm_logs');
    const storedRsvps = localStorage.getItem('alm_rsvps');
    if (storedLogs) {
      setLoginLogs(JSON.parse(storedLogs));
    }
    if (storedRsvps) {
      setRsvpEventIds(JSON.parse(storedRsvps));
    }
    if (isMember) {
      MyProfile();
      (async () => {
        try {
          const { data: { data }, success, error } = await EventsService.getAllEvents()
          if (data && success && !error) {
            setEvents(data);
          }
        } catch (error) {
          console.error("Error fetching featured events:", error);
        }
      })()
    }
  }, []);

  const isPublicView = currentView.startsWith('PUBLIC_') || currentView.startsWith('AUTH_');

  useEffect(() => {
    if (currentView !== "PUBLIC_EVENTS") return;
    (async () => {
      try {
        const { data: { data }, success, error } = await EventsService.getAllEvents()
        if (data && success && !error) {
          setEvents(data);
        }
      } catch (error) {
        console.error("Error fetching featured events:", error);
      }
    })()
  }, [])


  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);


  const handleAdminViewMember = (member: Member) => {
    setSelectedMember(member);
    setCurrentView('ADMIN_MEMBER_PROFILE');
  };

  if (isPublicView) {
    let content;
    switch (currentView) {
      case 'PUBLIC_HOME': content = <PublicHome onNavigate={handleNavigate} events={events} albums={albums} />; break;
      case 'PUBLIC_ABOUT': content = <PublicAbout />; break;
      case 'PUBLIC_EVENTS':
        content = <PublicEvents
          events={events}
          rsvpEventIds={rsvpEventIds}
          onToggleRsvp={handleToggleRsvp}
          currentUser={currentUser}
          onNavigate={handleNavigate}
        />;
        break;
      case 'PUBLIC_GALLERY': content = <PublicGallery albums={albums} photos={photos} />; break;
      case 'PUBLIC_FINANCE': content = <PublicFinance />; break;
      case 'PUBLIC_LEADERS': content = <PublicLeaders />; break;
      case 'PUBLIC_CONTACT': content = <PublicContact onSubmitFeedback={handleFeedbackSubmit} />; break;
      case 'AUTH_LOGIN': content = <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />; break;
      case 'AUTH_REGISTER': content = <RegisterPage onNavigate={handleNavigate} onRegister={handleRegister} />; break;
      default: content = <PublicHome onNavigate={handleNavigate} events={events} albums={albums} />;
    }
    return (
      <PublicLayout currentView={currentView} onNavigate={handleNavigate}>
        {content}
        <Toast toast={toast} />
      </PublicLayout>
    );
  }

  // Logic for Auth Views (Member/Admin)
  const renderAuthContent = () => {
    switch (currentView) {
      // Member Views
      case 'MEMBER_HOME':
        return <MemberDashboard
          events={events}
          announcements={announcements}
          rsvpEventIds={rsvpEventIds}
          onToggleRsvp={handleToggleRsvp}
          user={currentUser}
          haandleEditProfile={() => handleNavigate("MEMBER_PROFILE")}
        />;
      case 'MEMBER_EVENTS':
        return <MemberEvents
          events={events}
          rsvpEventIds={rsvpEventIds}
          onToggleRsvp={handleToggleRsvp}
        />;
      case 'MEMBER_PROFILE': {
        const userProfile = getMyProfile();
        return <MemberProfile user={userProfile && 'id' in userProfile ? userProfile as Member : null} onSave={handleUpdateProfile} />;
      }
      case 'MEMBER_FINANCE': return <MemberFinance transactions={transactions} />;
      case 'MEMBER_GALLERY': return <MemberGallery albums={albums} photos={photos} />;
      case 'MEMBER_FEEDBACK': return <MemberFeedback onSubmit={handleFeedbackSubmit} user={currentUser} />;

      // Admin Views
      case 'ADMIN_DASHBOARD':
        return <AdminDashboard
          members={members}
          events={events}
          transactions={transactions}
          loginLogs={loginLogs}
          onNavigate={handleNavigate}
        />;
      case 'ADMIN_MEMBERS':
        return <AdminMembers
          members={members}
          onAddMember={handleAddMember}
          onUpdateMember={handleUpdateMember}
          onDeleteMember={handleDeleteMember}
          onViewMember={handleAdminViewMember}
        />;
      case 'ADMIN_MEMBER_PROFILE':
        return selectedMember ? (
          <AdminMemberProfile
            member={selectedMember}
            onBack={() => setCurrentView('ADMIN_MEMBERS')}
            loginLogs={loginLogs.filter(l => l.userId === selectedMember.id)}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
          />
        ) : <AdminMembers members={members} onAddMember={handleAddMember} onUpdateMember={handleUpdateMember} onDeleteMember={handleDeleteMember} onViewMember={handleAdminViewMember} />;
      case 'ADMIN_EVENTS':
        return <AdminEvents
          events={events}
          onAddEvent={async (e) => handleAddEvent(e)}
          onUpdateEvent={handleUpdateEvent}
          onDeleteEvent={handleDeleteEvent}
        />;
      case 'ADMIN_FINANCE': return <AdminFinance transactions={transactions} onAddTransaction={handleAddTransaction} />;
      case 'ADMIN_CONTENT': return <AdminContent announcements={announcements} onAddAnnouncement={handleAddAnnouncement}
        onDeleteAnnouncement={handleDeleteAnnouncement} />;
      case 'ADMIN_INBOX':
        return <AdminInbox
          feedback={feedback}
          onDelete={handleDeleteFeedback}
          onReply={handleReplyFeedback}
          onArchive={handleArchiveFeedback}
        />;

      default: return <div className="p-10">Page not found</div>;
    }
  };

  return (
    <Layout
      currentView={currentView}
      role={role}
      currentUser={currentUser}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      toggleRole={toggleRole}
    >
      {renderAuthContent()}
      <Toast toast={toast} />
    </Layout>
  );
}

// Simple Toast Component
const Toast = ({ toast }: { toast: { message: string; type: 'success' | 'error' } | null }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          className={`fixed bottom-8 left-1/2 px-6 py-3 rounded-full shadow-xl text-white font-medium text-sm flex items-center gap-2 z-[9999] ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
        >
          <Icon name={toast.type === 'success' ? 'check_circle' : 'error'} />
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
