/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TinderDiscoverGrid } from './components/TinderDiscoverGrid';
import { TinderSwipeDeck } from './components/TinderSwipeDeck';
import { MatchesView } from './components/MatchesView';
import { OmegleVideoRoulette } from './components/OmegleVideoRoulette';
import { UserProfileTab } from './components/UserProfileTab';
import { TinderBottomNav, TinderTab } from './components/TinderBottomNav';
import { ProfileDetailModal } from './components/ProfileDetailModal';
import { DiscoveryFiltersModal } from './components/DiscoveryFiltersModal';
import { GreenRoomModal } from './components/GreenRoomModal';
import { MeetingRoom } from './components/MeetingRoom';
import { DeviceSettingsModal } from './components/DeviceSettingsModal';
import { VirtualBackgroundModal } from './components/VirtualBackgroundModal';
import { MapsDateSpotExplorer } from './components/MapsDateSpotExplorer';
import { DatingProfile, INITIAL_PROFILES } from './data/profiles';
import { VirtualBackgroundType, UserLocation } from './types/meeting';
import { UserProfile } from './types/user';
import { useUserLocation } from './hooks/useUserLocation';
import { useSubscription } from './hooks/useSubscription';
import { SignUpModal } from './components/SignUpModal';
import { EighteenPlusPolicyModal } from './components/EighteenPlusPolicyModal';
import { SubscriptionModal } from './components/SubscriptionModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TinderTab>('discover');
  const [view, setView] = useState<'main' | 'green_room' | 'in_meeting'>('main');
  const [roomId, setRoomId] = useState<string>('');

  const {
    subscription,
    isVip,
    callsRemainingToday,
    chatsRemainingToday,
    canMakeVideoCall,
    canSendChatMessage,
    recordVideoCall,
    recordChatMessage,
    activateSubscription,
  } = useSubscription();

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionReason, setSubscriptionReason] = useState<'limit_reached' | 'chat_limit' | 'manual'>('manual');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('nainocall_user_profile') || localStorage.getItem('zyntricall_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      id: 'user_default',
      name: localStorage.getItem('nainocall_user_name') || localStorage.getItem('zyntricall_user_name') || 'Aishwarya',
      age: 24,
      birthDate: '2002-04-18',
      gender: 'female',
      lookingFor: 'everyone',
      bio: 'Passionate about live video dates, coffee talks & spontaneous weekend trips.',
      city: 'Mumbai',
      country: 'India',
      interests: ['☕ Coffee', '🎵 Music', '✈️ Travel', '🍕 Foodie'],
      is18PlusVerified: true,
      agreedTo18PlusPolicy: true,
      policyAgreedAt: Date.now(),
      registeredAt: Date.now(),
    };
  });

  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [show18PlusPolicyModal, setShow18PlusPolicyModal] = useState(false);

  const [userName, setUserName] = useState<string>(
    () => userProfile?.name || localStorage.getItem('nainocall_user_name') || localStorage.getItem('zyntricall_user_name') || 'Aishwarya'
  );
  const [currentCity, setCurrentCity] = useState(
    () => (userProfile?.city ? `${userProfile.city}, ${userProfile.country || 'India'}` : 'Mumbai, India')
  );
  const [joinedLocation, setJoinedLocation] = useState<UserLocation | null>(null);

  const {
    location: userLocation,
    permissionState: locationPermissionState,
    isLoading: isLocationLoading,
    requestLocation,
  } = useUserLocation();

  // Sync detected location city to currentCity
  useEffect(() => {
    if (userLocation?.city && !userProfile?.city) {
      setCurrentCity(`${userLocation.city}, ${userLocation.country || 'India'}`);
    }
  }, [userLocation, userProfile]);

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    setUserName(profile.name);
    localStorage.setItem('nainocall_user_profile', JSON.stringify(profile));
    localStorage.setItem('nainocall_user_name', profile.name);
    if (profile.city) {
      setCurrentCity(`${profile.city}, ${profile.country || 'India'}`);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('nainocall_user_profile');
    localStorage.removeItem('zyntricall_user_profile');
    setUserProfile(null);
    setShowSignUpModal(true);
  };
  const [likedIds, setLikedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nainocall_liked_ids') || localStorage.getItem('zyntricall_liked_ids');
      return saved ? JSON.parse(saved) : ['aarohi', 'sneha'];
    } catch {
      return ['aarohi', 'sneha'];
    }
  });

  const [selectedProfile, setSelectedProfile] = useState<DatingProfile | null>(null);
  const [dateSpotPartner, setDateSpotPartner] = useState<DatingProfile | null>(null);
  const [showDateModal, setShowDateModal] = useState<boolean>(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showBackgroundsModal, setShowBackgroundsModal] = useState(false);
  const [virtualBackground, setVirtualBackground] = useState<VirtualBackgroundType>('none');
  const [initialAudioMuted, setInitialAudioMuted] = useState(false);
  const [initialVideoOff, setInitialVideoOff] = useState(false);

  // Check URL query parameters on load (e.g. ?room=zyn-742-kvp)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      const clean = roomParam.trim().toLowerCase();
      setRoomId(clean);
      setView('green_room');
    }
  }, []);

  const handleToggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem('nainocall_liked_ids', JSON.stringify(next));
      return next;
    });
  };

  const handleStartProfileCall = (profile: DatingProfile) => {
    if (!canMakeVideoCall()) {
      setSubscriptionReason('limit_reached');
      setShowSubscriptionModal(true);
      return;
    }
    recordVideoCall();
    const customRoom = `call_${profile.id}_${Date.now().toString(36)}`;
    setRoomId(customRoom);
    setSelectedProfile(null);
    setView('green_room');
  };

  const handleJoinFromGreenRoom = (
    finalName: string,
    muted: boolean,
    videoOff: boolean,
    background: VirtualBackgroundType,
    loc?: UserLocation | null
  ) => {
    setUserName(finalName);
    setInitialAudioMuted(muted);
    setInitialVideoOff(videoOff);
    setVirtualBackground(background);
    setJoinedLocation(loc || userLocation || null);
    setView('in_meeting');
  };

  const handleLeaveMeeting = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.pushState({}, '', url.toString());
    setView('main');
  };

  const handleCancelGreenRoom = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.pushState({}, '', url.toString());
    setView('main');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-slate-900 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* 1. Main Dashboard Views */}
      {view === 'main' && (
        <>
          {activeTab === 'discover' && (
            <TinderDiscoverGrid
              likedIds={likedIds}
              onToggleLike={handleToggleLike}
              onSelectProfile={(p) => setSelectedProfile(p)}
              onStartVideoCall={handleStartProfileCall}
              onOpenFilters={() => setShowFiltersModal(true)}
              onOpenProfileTab={() => setActiveTab('profile')}
              onOpenDateExplorer={(loc) => {
                setActiveTab('dates');
              }}
              currentCity={currentCity}
              onSelectCity={(city) => setCurrentCity(city)}
              location={userLocation}
              permissionState={locationPermissionState}
              onRequestLocation={requestLocation}
              isLocationLoading={isLocationLoading}
              onOpenSignUp={() => setShowSignUpModal(true)}
              onOpenPolicy={() => setShow18PlusPolicyModal(true)}
              isVip={isVip}
              onOpenSubscription={() => {
                setSubscriptionReason('manual');
                setShowSubscriptionModal(true);
              }}
              callsRemainingToday={callsRemainingToday}
            />
          )}

          {activeTab === 'swipe' && (
            <TinderSwipeDeck
              onStartVideoCall={handleStartProfileCall}
              onMatch={(p) => {
                if (!likedIds.includes(p.id)) {
                  handleToggleLike(p.id);
                }
              }}
            />
          )}

          {activeTab === 'dates' && (
            <MapsDateSpotExplorer
              onStartVideoCall={handleStartProfileCall}
              onSendMessage={(partnerName, placeName, mapUrl) => {
                setActiveTab('messages');
              }}
            />
          )}

          {activeTab === 'matches' && (
            <MatchesView
              likedIds={likedIds}
              onStartVideoCall={handleStartProfileCall}
              activeMode="matches"
              isVip={isVip}
              chatsRemainingToday={chatsRemainingToday}
              canMakeVideoCall={canMakeVideoCall}
              canSendChatMessage={canSendChatMessage}
              onRecordChatMessage={recordChatMessage}
              onOpenSubscription={(reason) => {
                setSubscriptionReason(reason || 'manual');
                setShowSubscriptionModal(true);
              }}
            />
          )}

          {activeTab === 'messages' && (
            <MatchesView
              likedIds={likedIds}
              onStartVideoCall={handleStartProfileCall}
              activeMode="messages"
              isVip={isVip}
              chatsRemainingToday={chatsRemainingToday}
              canMakeVideoCall={canMakeVideoCall}
              canSendChatMessage={canSendChatMessage}
              onRecordChatMessage={recordChatMessage}
              onOpenSubscription={(reason) => {
                setSubscriptionReason(reason || 'manual');
                setShowSubscriptionModal(true);
              }}
            />
          )}

          {activeTab === 'omegle' && (
            <OmegleVideoRoulette
              userName={userName}
              onExit={() => setActiveTab('discover')}
              isVip={isVip}
              onOpenSubscription={() => {
                setSubscriptionReason('manual');
                setShowSubscriptionModal(true);
              }}
            />
          )}

          {activeTab === 'profile' && (
            <UserProfileTab
              userProfile={userProfile}
              subscription={subscription}
              onOpenSubscription={() => {
                setSubscriptionReason('manual');
                setShowSubscriptionModal(true);
              }}
              onOpenSignUp={() => setShowSignUpModal(true)}
              onOpenSettings={() => setShowDiagnostics(true)}
              onStartOmegle={() => setActiveTab('omegle')}
              onOpenPolicy={() => setShow18PlusPolicyModal(true)}
              onSignOut={handleSignOut}
            />
          )}

          {/* Bottom Tab Bar (shown when not in Omegle full screen) */}
          {activeTab !== 'omegle' && (
            <TinderBottomNav
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab)}
              matchesCount={likedIds.length}
              unreadMessagesCount={2}
            />
          )}
        </>
      )}

      {/* 2. Pre-Join Green Room Staging */}
      {view === 'green_room' && (
        <GreenRoomModal
          roomId={roomId}
          initialName={userName}
          onJoin={handleJoinFromGreenRoom}
          onCancel={handleCancelGreenRoom}
          onOpenSettings={() => setShowDiagnostics(true)}
          onOpenBackgrounds={() => setShowBackgroundsModal(true)}
          currentBackground={virtualBackground}
        />
      )}

      {/* 3. In-Meeting Active Video Call */}
      {view === 'in_meeting' && (
        <MeetingRoom
          roomId={roomId}
          userName={userName}
          initialAudioMuted={initialAudioMuted}
          initialVideoOff={initialVideoOff}
          initialBackground={virtualBackground}
          initialLocation={joinedLocation || userLocation}
          onLeave={handleLeaveMeeting}
          isVip={isVip}
        />
      )}

      {/* Profile Detail Bottom Sheet / Modal */}
      {selectedProfile && (
        <ProfileDetailModal
          profile={selectedProfile}
          isLiked={likedIds.includes(selectedProfile.id)}
          onClose={() => setSelectedProfile(null)}
          onLikeToggle={(id) => handleToggleLike(id)}
          onStartVideoCall={(p) => handleStartProfileCall(p)}
          onSendMessage={(p) => {
            setSelectedProfile(null);
            if (!likedIds.includes(p.id)) handleToggleLike(p.id);
            setActiveTab('messages');
          }}
          onPlanDate={(p) => {
            setSelectedProfile(null);
            setDateSpotPartner(p);
            setShowDateModal(true);
          }}
          isVip={isVip}
        />
      )}

      {/* Google Maps Date Spot Modal for Selected Partner */}
      {showDateModal && (
        <MapsDateSpotExplorer
          isModal={true}
          initialPartner={dateSpotPartner}
          initialLocation={dateSpotPartner ? dateSpotPartner.location.split(',')[0].trim() : 'Bandra West'}
          onStartVideoCall={(p) => {
            setShowDateModal(false);
            handleStartProfileCall(p);
          }}
          onSendMessage={(partnerName, placeName, mapUrl) => {
            setShowDateModal(false);
            setActiveTab('messages');
          }}
          onClose={() => setShowDateModal(false)}
        />
      )}

      {/* Filters Modal */}
      {showFiltersModal && (
        <DiscoveryFiltersModal
          onClose={() => setShowFiltersModal(false)}
          onApply={(dist) => {
            // applied
          }}
        />
      )}

      {/* Global Device Settings Modal */}
      {showDiagnostics && (
        <DeviceSettingsModal onClose={() => setShowDiagnostics(false)} />
      )}

      {/* Virtual Background Modal */}
      {showBackgroundsModal && (
        <VirtualBackgroundModal
          currentBackground={virtualBackground}
          onSelectBackground={(bg) => setVirtualBackground(bg)}
          onClose={() => setShowBackgroundsModal(false)}
        />
      )}

      {/* 18+ Member Sign Up & Profile Edit Modal */}
      <SignUpModal
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onSaveProfile={handleSaveProfile}
        initialProfile={userProfile}
        defaultCity={currentCity}
      />

      {/* 18+ Safety & Age Policy Modal */}
      <EighteenPlusPolicyModal
        isOpen={show18PlusPolicyModal}
        onClose={() => setShow18PlusPolicyModal(false)}
      />

      {/* VIP Subscription & Payment Gateway Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal
          subscription={subscription}
          userName={userName}
          onActivatePlan={(details) => {
            activateSubscription(details);
            setShowSubscriptionModal(false);
          }}
          onClose={() => setShowSubscriptionModal(false)}
          reason={subscriptionReason}
        />
      )}
    </div>
  );
}
