

import { useState, useCallback, useEffect } from 'react';
import { 
    Event, Member, AvailabilityStatus, EventType, Court, Booking, CourtType,
    Survey, SurveyResponse, Post, Coach, LessonBooking, Group, GroupMessage, LadderPlayer, Challenge, 
    ChallengeStatus, PartnerRequest, GameType, RequestStatus, Announcement, Notification, View,
    PaymentStatus, Transaction, Article, ArticleCategory, PaymentMethod
} from '../types';
import { loadFromStorage, saveToStorage, clearStorage } from '../services/storageService';

const initialMembers: Member[] = [
  { id: '1', name: 'Alice (Admin)', avatarUrl: 'https://picsum.photos/id/1027/100/100', clubCredits: 500, ntfConsent: true, ntfId: 'NTF-12345', consentAgreedTimestamp: Date.now() - 86400000 * 10 },
  { id: '2', name: 'Bob', avatarUrl: 'https://picsum.photos/id/1005/100/100', clubCredits: 100, ntfConsent: true, ntfId: 'NTF-67890', consentAgreedTimestamp: Date.now() - 86400000 * 5 },
  { id: '3', name: 'Charlie', avatarUrl: 'https://picsum.photos/id/1011/100/100', clubCredits: 250, ntfConsent: false },
  { id: '4', name: 'Diana', avatarUrl: 'https://picsum.photos/id/1012/100/100', clubCredits: 0, ntfConsent: true, consentAgreedTimestamp: Date.now() - 86400000 * 20 },
  { id: '5', name: 'Eve', avatarUrl: 'https://picsum.photos/id/1013/100/100', clubCredits: 75, ntfConsent: false },
  { id: '6', name: 'Frank', avatarUrl: 'https://picsum.photos/id/1015/100/100', clubCredits: 1000, ntfConsent: true, ntfId: 'NTF-54321', consentAgreedTimestamp: Date.now() - 86400000 * 15 },
];

const getTodaysDateWithHour = (hour: number) => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date;
}

const initialEvents: Event[] = [
  {
    id: 'e1',
    title: 'Klubbmesterskap - Runde 1',
    type: EventType.MATCH,
    date: new Date(new Date().setDate(new Date().getDate() + 3)),
    location: 'Bane 1 & 2',
    description: 'Første runde i det årlige klubbmesterskapet. Møt opp 15 minutter før.',
    availability: initialMembers.map(m => ({ memberId: m.id, status: AvailabilityStatus.PENDING })),
  },
  {
    id: 'e2',
    title: 'Avansert serve-trening',
    type: EventType.TRAINING,
    date: new Date(new Date().setDate(new Date().getDate() + 7)),
    location: 'Bane 3',
    description: 'Fokus på kick-server og slice-server med treneren.',
    availability: initialMembers.map(m => ({ memberId: m.id, status: AvailabilityStatus.PENDING })),
  },
];
const initialCourts: Court[] = [
  { id: 'c1', name: 'Boblehall 1', type: CourtType.INDOOR },
  { id: 'c2', name: 'Boblehall 2', type: CourtType.INDOOR },
  { id: 'c3', name: 'Boblehall 3', type: CourtType.INDOOR },
  { id: 'c4', name: 'Utebane 1', type: CourtType.OUTDOOR },
  { id: 'c5', name: 'Utebane 2', type: CourtType.OUTDOOR },
  { id: 'c6', name: 'Utebane 3', type: CourtType.OUTDOOR },
];


const initialBookings: Booking[] = [
    { id: 'b1', courtId: 'c1', memberId: '2', startTime: getTodaysDateWithHour(10), price: 200, paymentStatus: PaymentStatus.PAID },
    { id: 'b2', courtId: 'c4', memberId: '3', startTime: getTodaysDateWithHour(11), price: 150, paymentStatus: PaymentStatus.PAID },
];
const initialSurveys: Survey[] = [
    {
        id: 's1',
        title: '2024 Klubb-tilbakemelding',
        description: 'Hjelp oss med å forbedre klubben ved å gi din verdifulle tilbakemelding på fasiliteter og aktiviteter.',
        questions: [
            { id: 'q1', text: 'Hvordan vil du rangere vedlikeholdet av banene?', options: ['Utmerket', 'Bra', 'Gjennomsnittlig', 'Dårlig'] },
        ]
    }
];
const initialSurveyResponses: SurveyResponse[] = [];
const initialPosts: Post[] = [
    {
        id: 'p1',
        authorId: '2', // Bob
        timestamp: new Date(new Date().setHours(new Date().getHours() - 2)),
        textContent: 'Flotte forhold på utebanene i dag! Noen som er keen på en uformell double rundt kl. 17?',
    }
];
const initialCoaches: Coach[] = [
    {
        id: 'coach1',
        name: 'Henrik Steffensen',
        avatarUrl: 'https://picsum.photos/id/1025/200/200',
        bio: 'Tidligere profesjonell spiller med over 15 års trenererfaring.',
        specialties: ['Konkurransespillere', 'Serve-teknikk', 'Juniortrening']
    }
];
const initialLessonBookings: LessonBooking[] = [
    { id: 'lb1', coachId: 'coach1', memberId: '5', courtId: 'c3', startTime: getTodaysDateWithHour(13), price: 600, paymentStatus: PaymentStatus.PAID }
];
const initialGroups: Group[] = [
    { id: 'g1', name: 'Herrelaget', description: 'Koordinering for herrelagets treninger og kamper.', memberIds: ['2', '3'], coachId: 'coach1' },
    { id: 'g2', name: 'Beginner Course Mondays', description: 'Group for the beginner course on Mondays.', memberIds: ['4'], coachId: 'coach1' },
];
const initialGroupMessages: GroupMessage[] = [
    { id: 'gm1', groupId: 'g1', authorId: '2', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), textContent: 'Noen som kan ta en treningskamp på onsdag?' },
    { id: 'gm2', groupId: 'g2', authorId: 'coach1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), textContent: 'Hi everyone, looking forward to our first session on Monday! Please remember to bring water.' },
    { id: 'gm3', groupId: 'g2', authorId: '4', timestamp: new Date(Date.now() - 1000 * 60 * 30), textContent: 'Great, see you there!' },
];

const initialLadderPlayers: LadderPlayer[] = initialMembers.map((member, index) => ({
    memberId: member.id,
    rank: index + 1,
    wins: Math.floor(Math.random() * 10),
    losses: Math.floor(Math.random() * 5),
}));

const initialChallenges: Challenge[] = [
    { id: 'ch1', challengerId: '3', challengedId: '2', status: ChallengeStatus.PENDING, issuedDate: new Date(Date.now() - 86400000) },
    { id: 'ch2', challengerId: '1', challengedId: '4', status: ChallengeStatus.ACCEPTED, issuedDate: new Date(Date.now() - 172800000) },
];

const initialPartnerRequests: PartnerRequest[] = [
    { id: 'pr1', memberId: '4', date: new Date(new Date().setDate(new Date().getDate() + 1)), timeWindow: 'Afternoon (14-17)', gameType: GameType.SINGLES, status: RequestStatus.OPEN, timestamp: new Date() },
];

const initialAnnouncements: Announcement[] = [
    { id: 'an1', authorId: '1', title: 'Court Maintenance Next Week', content: 'Please be aware that the outdoor courts will be closed for pressure washing and repainting from Monday to Wednesday next week. The indoor courts will remain open.', timestamp: new Date(Date.now() - 86400000 * 2) },
];

const initialTransactions: Transaction[] = [
    { id: 't-award-1', memberId: '1', date: new Date(Date.now() - 86400000 * 10), description: "Initial club credits", amount: 500, paymentMethod: 'Awarded' },
    { id: 't-b1', memberId: '2', date: getTodaysDateWithHour(10), description: "Court Booking: Boblehall 1", amount: -200, paymentMethod: 'Card' },
    { id: 't-b2', memberId: '3', date: getTodaysDateWithHour(11), description: "Court Booking: Utebane 1", amount: -150, paymentMethod: 'Card' },
    { id: 't-l1', memberId: '5', date: getTodaysDateWithHour(13), description: "Lesson: Henrik Steffensen", amount: -600, paymentMethod: 'Card' },
    { id: 't-award-2', memberId: '2', date: new Date(Date.now() - 86400000 * 2), description: "Help with tournament setup", amount: 100, paymentMethod: 'Awarded' },
];

const initialLearningArticles: Article[] = [
    {
        id: 'tech1',
        title: 'Mastering the Topspin Forehand',
        category: ArticleCategory.TECHNICAL,
        summary: 'Learn the key biomechanics and drills to develop a powerful and consistent topspin forehand.',
        content: `The topspin forehand is a modern tennis essential. It allows for both power and control, using spin to bring the ball down into the court.
The key is to swing from low to high, brushing up the back of the ball.
Start with a semi-western grip. This places your palm more underneath the racquet.
Make contact with the ball out in front of your body, around waist height, for maximum leverage.
Use your hips and torso to generate power by uncoiling your body into the shot.`
    },
    {
        id: 'tech2',
        title: 'Improving Your Serve Toss',
        category: ArticleCategory.TECHNICAL,
        summary: 'A consistent toss is the foundation of a reliable serve. Here are tips to perfect it.',
        content: `A bad toss can ruin even the best service motion. Consistency is the goal.
Hold the ball in your fingertips, not your palm, for better control.
Lift the ball straight up with a relaxed arm, as if placing it on a shelf just out of reach.
The ideal toss location is slightly in front of you and to the right (for right-handers), allowing you to hit up and into the court.
Practice tossing without even hitting the ball. Repetition builds muscle memory.`
    },
    {
        id: 'tac1',
        title: 'When to Approach the Net',
        category: ArticleCategory.TACTICAL,
        summary: 'Understand the high-percentage situations for moving forward and finishing points at the net.',
        content: `Net play is about calculated aggression, not reckless rushing.
Approach the net behind a strong shot that puts your opponent on the defensive, such as a deep approach shot to their weaker side.
A short ball from your opponent (landing inside the service line) is a green light to attack.
Following a big, well-placed serve to the net can be a powerful tactic to apply immediate pressure.`
    },
    {
        id: 'tac2',
        title: 'Playing Percentage Tennis',
        category: ArticleCategory.TACTICAL,
        summary: 'Win more matches by making smarter, higher-percentage shot selections.',
        content: `Percentage tennis is about minimizing your unforced errors while forcing your opponent into difficult situations.
Aim for large targets. Cross-court shots are higher percentage than down-the-line because the net is lower in the middle and the court is longer diagonally.
When in a defensive position, hit the ball deep down the middle of the court to reduce your opponent's angles and give yourself time to recover.
Your primary goal should be to keep the ball in play and wait for the right opportunity to be aggressive.`
    },
    {
        id: 'men1',
        title: 'Staying Positive After Errors',
        category: ArticleCategory.MENTAL,
        summary: 'Develop mental routines to reset quickly and maintain focus after making a mistake.',
        content: `Tennis is a game of errors. The best players are not those who don't make mistakes, but those who respond to them best.
Use the time between points to reset. Turn your back to the net, take a deep breath, and focus on your strategy for the next point.
Develop a short-term memory. Once a point is over, it's over. Don't dwell on a missed shot.
Focus on what you can control: your effort, your attitude, and your game plan.`
    },
     {
        id: 'men2',
        title: 'Using Visualization for Matches',
        category: ArticleCategory.MENTAL,
        summary: 'Prepare your mind for competition by mentally rehearsing success.',
        content: `Visualization is a powerful tool used by elite athletes. Before a match, take a few minutes to close your eyes and picture yourself playing.
Imagine yourself hitting clean, powerful serves and crisp volleys.
Visualize yourself moving effortlessly around the court, feeling confident and calm under pressure.
Mentally rehearse your game plan, seeing yourself execute your strategies successfully against your opponent.
This mental practice builds confidence and helps your brain prepare for the real thing.`
    },
    {
        id: 'phy1',
        title: 'Essential Tennis Footwork Drills',
        category: ArticleCategory.PHYSICAL,
        summary: 'Improve your court coverage and balance with these fundamental footwork exercises.',
        content: `Great shots start from the ground up. Excellent footwork gets you in the right position to hit the ball effectively.
The Split Step is the most important move. Always perform a small hop as your opponent is about to hit the ball. This prepares you to move explosively in any direction.
Practice side-shuffles along the baseline to improve your lateral movement for groundstrokes.
Use crossover steps for covering long distances quickly when moving to a wide ball.`
    },
    {
        id: 'phy2',
        title: 'Stretching for Injury Prevention',
        category: ArticleCategory.PHYSICAL,
        summary: 'A proper stretching routine can improve flexibility and reduce the risk of common tennis injuries.',
        content: `Stretching is vital for longevity in tennis.
Dynamic stretching should be done before you play. This involves active movements like leg swings, arm circles, and torso twists to warm up your muscles.
Static stretching should be done after you play. This involves holding a stretch for 20-30 seconds to improve flexibility.
Focus on key areas for tennis players: shoulders, hips, hamstrings, and calves.`
    },
];

const ADMIN_ID = '1';

const COURT_PRICE_INDOOR = 200;
const COURT_PRICE_OUTDOOR = 150;
const LESSON_PRICE = 600;

export const useClubData = () => {
  const [members, setMembers] = useState<Member[]>(loadFromStorage('members', initialMembers));
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [currentUser, setCurrentUser] = useState<Member | null>(loadFromStorage('currentUser', null));
  const [courts] = useState<Court[]>(initialCourts);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [surveys] = useState<Survey[]>(initialSurveys);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>(initialSurveyResponses);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [coaches] = useState<Coach[]>(initialCoaches);
  const [lessonBookings, setLessonBookings] = useState<LessonBooking[]>(initialLessonBookings);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>(initialGroupMessages);
  const [ladderPlayers, setLadderPlayers] = useState<LadderPlayer[]>(initialLadderPlayers);
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
  const [partnerRequests, setPartnerRequests] = useState<PartnerRequest[]>(initialPartnerRequests);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [learningArticles, _setLearningArticles] = useState<Article[]>(initialLearningArticles);
  const [ntfSyncStatus, setNtfSyncStatus] = useState<{ lastSync: Date | null, membersSynced: number, membersSkipped: number }>({ lastSync: null, membersSynced: 0, membersSkipped: 0 });

  useEffect(() => {
    saveToStorage('members', members);
  }, [members]);

  useEffect(() => {
    saveToStorage('currentUser', currentUser);
  }, [currentUser]);

  const addNotification = useCallback((memberId: string, message: string, link: View, relatedId?: string) => {
      const newNotification: Notification = {
          id: `notif-${Date.now()}`,
          memberId,
          message,
          link,
          relatedId,
          isRead: false,
          timestamp: new Date(),
      };
      setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const addTransaction = useCallback((memberId: string, description: string, amount: number, paymentMethod: PaymentMethod) => {
      const newTransaction: Transaction = { 
          id: `t-${Date.now()}`, 
          memberId,
          date: new Date(), 
          description, 
          amount,
          paymentMethod
      };
      setTransactions(prev => [newTransaction, ...prev]);
  }, []);

  const addBooking = useCallback((courtId: string, memberId: string, startTime: Date): Booking | null => {
    const conflict = bookings.find(b => b.courtId === courtId && b.startTime.getTime() === startTime.getTime());
    if (conflict) { alert("This time is already booked."); return null; }
    const lessonConflict = lessonBookings.find(b => b.courtId === courtId && b.startTime.getTime() === startTime.getTime());
    if (lessonConflict) { alert("This time is reserved for a private lesson."); return null; }
    
    const court = courts.find(c => c.id === courtId);
    if (!court) return null;

    const price = court.type === CourtType.INDOOR ? COURT_PRICE_INDOOR : COURT_PRICE_OUTDOOR;
    
    const newBooking: Booking = { id: `b${Date.now()}`, courtId, memberId, startTime, price, paymentStatus: PaymentStatus.UNPAID };
    setBookings(prev => [...prev, newBooking]);
    return newBooking;
  }, [bookings, lessonBookings, courts]);

  const payForBooking = useCallback((bookingId: string, method: PaymentMethod) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return false;
    const member = members.find(m => m.id === booking.memberId);
    if(!member) return false;

    if (method === 'Credits') {
        if (member.clubCredits < booking.price) {
            alert("Insufficient club credits.");
            return false;
        }
        const newCredits = member.clubCredits - booking.price;
        const updatedMembers = members.map(m => m.id === member.id ? {...m, clubCredits: newCredits} : m);
        setMembers(updatedMembers);
        if (member.id === currentUser?.id && currentUser) {
            setCurrentUser(prev => prev ? ({...prev, clubCredits: newCredits}) : null);
        }
    }

    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, paymentStatus: PaymentStatus.PAID } : b));
    const court = courts.find(c => c.id === booking.courtId);
    addTransaction(member.id, `Court Booking: ${court?.name}`, -booking.price, method);

    return true;
  }, [bookings, members, currentUser?.id, courts, addTransaction]);

  const addLessonBooking = useCallback((coachId: string, memberId: string, startTime: Date): LessonBooking | null => {
    const coachIsBusy = lessonBookings.some(lb => lb.coachId === coachId && lb.startTime.getTime() === startTime.getTime());
    if (coachIsBusy) { alert("Coach is already booked at this time."); return null; }
    const occupiedCourtIds = [...bookings, ...lessonBookings].filter(b => b.startTime.getTime() === startTime.getTime()).map(b => b.courtId);
    const availableCourt = courts.find(c => !occupiedCourtIds.includes(c.id));
    if (!availableCourt) { alert("Sorry, no courts are available at this time."); return null; }
    const newLessonBooking: LessonBooking = { id: `lb${Date.now()}`, coachId, memberId, courtId: availableCourt.id, startTime, price: LESSON_PRICE, paymentStatus: PaymentStatus.UNPAID };
    setLessonBookings(prev => [...prev, newLessonBooking]);
    addNotification(coachId, `${members.find(m => m.id === memberId)?.name} booked a lesson with you.`, View.LESSONS);
    return newLessonBooking;
  }, [bookings, lessonBookings, courts, members, addNotification]);

  const payForLessonBooking = useCallback((lessonId: string, method: PaymentMethod) => {
      const lesson = lessonBookings.find(l => l.id === lessonId);
      if (!lesson) return false;
      const member = members.find(m => m.id === lesson.memberId);
      if(!member) return false;
      
      if (method === 'Credits') {
          if (member.clubCredits < lesson.price) {
              alert("Insufficient club credits.");
              return false;
          }
          const newCredits = member.clubCredits - lesson.price;
          const updatedMembers = members.map(m => m.id === member.id ? {...m, clubCredits: newCredits} : m);
          setMembers(updatedMembers);
          if (member.id === currentUser?.id && currentUser) {
            setCurrentUser(prev => prev ? ({...prev, clubCredits: newCredits}) : null);
          }
      }

      setLessonBookings(prev => prev.map(l => l.id === lessonId ? { ...l, paymentStatus: PaymentStatus.PAID } : l));
      const coach = coaches.find(c => c.id === lesson.coachId);
      addTransaction(member.id, `Lesson: ${coach?.name}`, -lesson.price, method);
      return true;
  }, [lessonBookings, members, currentUser?.id, coaches, addTransaction]);

  const awardCredits = useCallback((memberId: string, amount: number, reason: string) => {
      if (amount <= 0) return;
      
      const newMembers = members.map(m => {
          if (m.id === memberId) {
              return { ...m, clubCredits: m.clubCredits + amount };
          }
          return m;
      });
      setMembers(newMembers);

      if (memberId === currentUser?.id && currentUser) {
          setCurrentUser(prev => prev ? ({...prev, clubCredits: prev.clubCredits + amount}) : null);
      }

      addTransaction(memberId, reason, amount, 'Awarded');
  }, [members, currentUser?.id, addTransaction]);
  
  const updateAvailability = useCallback((eventId: string, memberId: string, status: AvailabilityStatus) => {
    setEvents(prevEvents => prevEvents.map(event => event.id === eventId ? { ...event, availability: event.availability.map(avail => avail.memberId === memberId ? { ...avail, status } : avail) } : event));
  }, []);

  const submitSurveyResponse = useCallback((response: SurveyResponse) => {
    setSurveyResponses(prev => prev.some(r => r.surveyId === response.surveyId && r.memberId === response.memberId) ? prev : [...prev, response]);
  }, []);
  
  const addPost = useCallback((authorId: string, textContent: string, videoUrl?: string) => {
    const newPost: Post = { id: `p${Date.now()}`, authorId, timestamp: new Date(), textContent, videoUrl: videoUrl || undefined };
    setPosts(prev => [newPost, ...prev]);
  }, []);

  const markNotificationsAsRead = useCallback(() => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const sendGroupMessage = useCallback((groupId: string, authorId: string, textContent: string) => {
    const newMessage: GroupMessage = { id: `gm${Date.now()}`, groupId, authorId, textContent, timestamp: new Date() };
    setGroupMessages(prev => [...prev, newMessage]);
    
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const authorName = members.find(m => m.id === authorId)?.name || coaches.find(c => c.id === authorId)?.name;

    // Notify all members except the author
    group.memberIds.forEach(memberId => {
        if (memberId !== authorId) {
            addNotification(memberId, `New message in ${group.name} from ${authorName}`, View.GROUPS, groupId);
        }
    });

    // Also notify the coach, if they exist and are not the author
    if (group.coachId && group.coachId !== authorId) {
        addNotification(group.coachId, `New message in your group "${group.name}" from ${authorName}`, View.GROUPS, groupId);
    }
  }, [addNotification, groups, members, coaches]);

    const createGroup = useCallback((groupData: { name: string, description: string, coachId?: string }) => {
        const newGroup: Group = {
            ...groupData,
            id: `g-${Date.now()}`,
            memberIds: [],
        };
        setGroups(prev => [newGroup, ...prev]);
        if (newGroup.coachId) {
            addNotification(newGroup.coachId, `You've been assigned as coach for: ${newGroup.name}`, View.GROUPS, newGroup.id);
        }
    }, [addNotification]);

    const updateGroup = useCallback((groupId: string, updatedData: { name: string, description: string, coachId?: string }) => {
        setGroups(prev => {
            const originalGroup = prev.find(g => g.id === groupId);
            if (originalGroup) {
                // Notify new coach if changed
                if (updatedData.coachId && updatedData.coachId !== originalGroup.coachId) {
                    addNotification(updatedData.coachId, `You are now the coach for: ${updatedData.name}`, View.GROUPS, groupId);
                }
            }
            // Preserve existing members, only update details
            return prev.map(g => (g.id === groupId ? { ...g, ...updatedData } : g));
        });
    }, [addNotification]);
    
    const moveMemberToGroup = useCallback((memberId: string, targetGroupId: string | null) => {
        setGroups(prevGroups => {
            const newGroups = prevGroups.map(g => ({...g, memberIds: [...g.memberIds]}));

            // Find and remove from source group, if any
            const sourceGroup = newGroups.find(g => g.memberIds.includes(memberId));
            if (sourceGroup) {
                sourceGroup.memberIds = sourceGroup.memberIds.filter(id => id !== memberId);
            }

            // Add to target group, if any
            if (targetGroupId) {
                const targetGroup = newGroups.find(g => g.id === targetGroupId);
                if (targetGroup && !targetGroup.memberIds.includes(memberId)) {
                    targetGroup.memberIds.push(memberId);
                    addNotification(memberId, `You've been added to the group: ${targetGroup.name}`, View.GROUPS, targetGroupId);
                }
            }
            
            return newGroups;
        });
    }, [addNotification]);

    const deleteGroup = useCallback((groupId: string) => {
        setGroups(currentGroups => currentGroups.filter(g => g.id !== groupId));
        setGroupMessages(currentMessages => currentMessages.filter(m => m.groupId !== groupId));
    }, [groups, groupMessages]);


  // Ladder Functions
  const issueChallenge = useCallback((challengerId: string, challengedId: string) => {
    const newChallenge: Challenge = { id: `ch${Date.now()}`, challengerId, challengedId, status: ChallengeStatus.PENDING, issuedDate: new Date() };
    setChallenges(prev => [newChallenge, ...prev]);
    const challengerName = members.find(m => m.id === challengerId)?.name;
    addNotification(challengedId, `You have been challenged to a ladder match by ${challengerName}!`, View.LADDER);
  }, [members, addNotification]);

  const respondToChallenge = useCallback((challengeId: string, response: 'accept' | 'decline') => {
    setChallenges(prev => prev.map(ch => {
        if (ch.id === challengeId) {
            const newStatus = response === 'accept' ? ChallengeStatus.ACCEPTED : ChallengeStatus.DECLINED;
            const challengedName = members.find(m => m.id === ch.challengedId)?.name;
            const message = response === 'accept' 
                ? `${challengedName} accepted your challenge.`
                : `${challengedName} declined your challenge.`;
            addNotification(ch.challengerId, message, View.LADDER);
            return { ...ch, status: newStatus, resolvedDate: new Date() };
        }
        return ch;
    }));
  }, [members, addNotification]);

  const reportMatchResult = useCallback((challengeId: string, winnerId: string, score: string) => {
    let challenger: LadderPlayer | undefined, challenged: LadderPlayer | undefined;
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    setLadderPlayers(prev => {
        const players = [...prev];
        const challengerIndex = players.findIndex(p => p.memberId === challenge.challengerId);
        const challengedIndex = players.findIndex(p => p.memberId === challenge.challengedId);
        
        challenger = players[challengerIndex];
        challenged = players[challengedIndex];

        if (!challenger || !challenged) return prev;

        const loserId = winnerId === challenger.memberId ? challenged.memberId : challenger.memberId;
        
        challenger = { ...challenger, [challenger.memberId === winnerId ? 'wins' : 'losses']: challenger[challenger.memberId === winnerId ? 'wins' : 'losses'] + 1 };
        challenged = { ...challenged, [challenged.memberId === winnerId ? 'wins' : 'losses']: challenged[challenged.memberId === winnerId ? 'wins' : 'losses'] + 1 };
        
        const winner = winnerId === challenger.memberId ? challenger : challenged;
        const loser = winnerId === challenger.memberId ? challenged : challenger;

        // If winner has lower rank (higher number), they swap ranks
        if (winner.rank > loser.rank) {
            [winner.rank, loser.rank] = [loser.rank, winner.rank];
        }

        players[challengerIndex] = challenger.memberId === winner.memberId ? winner : loser;
        players[challengedIndex] = challenged.memberId === winner.memberId ? winner : loser;
        
        const winnerName = members.find(m => m.id === winnerId)?.name;
        addNotification(loserId, `Match result reported: You lost to ${winnerName} with a score of ${score}.`, View.LADDER);
        
        return players.sort((a,b) => a.rank - b.rank);
    });

    setChallenges(prev => prev.map(ch => ch.id === challengeId ? { ...ch, status: ChallengeStatus.COMPLETED, winnerId, score, resolvedDate: new Date() } : ch));
  }, [challenges, members, addNotification]);
  
  // Find Partner Functions
  const addPartnerRequest = useCallback((req: Omit<PartnerRequest, 'id' | 'status' | 'timestamp'>) => {
      const newRequest: PartnerRequest = { ...req, id: `pr-${Date.now()}`, status: RequestStatus.OPEN, timestamp: new Date() };
      setPartnerRequests(prev => [newRequest, ...prev]);
  }, []);

  const closePartnerRequest = useCallback((requestId: string) => {
      setPartnerRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: RequestStatus.CLOSED } : req));
  }, []);
  
  // Announcement Functions
  const addAnnouncement = useCallback((authorId: string, title: string, content: string) => {
      if (authorId !== ADMIN_ID) {
          alert("Only admins can create announcements.");
          return;
      }
      const newAnnouncement: Announcement = { id: `an-${Date.now()}`, authorId, title, content, timestamp: new Date() };
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      // Notify all members
      members.forEach(m => {
          if (m.id !== authorId) addNotification(m.id, `New Club Announcement: ${title}`, View.ANNOUNCEMENTS);
      });
  }, [members, addNotification]);

  const toggleNtfConsent = useCallback((memberId: string) => {
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, ntfConsent: !m.ntfConsent } : m));
      if(currentUser?.id === memberId && currentUser) {
          setCurrentUser(prev => prev ? ({ ...prev, ntfConsent: !prev.ntfConsent }) : null);
      }
  }, [currentUser?.id]);

  const syncWithNtf = useCallback(async () => {
    // This is a simulation of a backend API call.
    const membersToSync = members.filter(m => m.ntfConsent);
    const membersToSkip = members.filter(m => !m.ntfConsent);

    // Simulate creating NTF IDs for members who consented but don't have one
    const updatedMembers = members.map(m => {
        if (m.ntfConsent && !m.ntfId) {
            return { ...m, ntfId: `NTF-${Math.random().toString(36).substring(2, 9).toUpperCase()}` };
        }
        return m;
    });

    await new Promise(resolve => setTimeout(resolve, 2000)); // simulate network delay

    setMembers(updatedMembers);
    setNtfSyncStatus({
        lastSync: new Date(),
        membersSynced: membersToSync.length,
        membersSkipped: membersToSkip.length,
    });
    
    return { synced: membersToSync, skipped: membersToSkip };
  }, [members]);

  // Data management functions
  const agreeToPolicies = useCallback((memberId: string) => {
    const timestamp = Date.now();
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, consentAgreedTimestamp: timestamp } : m));
    if (currentUser?.id === memberId && currentUser) {
      setCurrentUser(prev => prev ? ({ ...prev, consentAgreedTimestamp: timestamp }) : null);
    }
  }, [currentUser?.id]);

  const updateMemberDetails = useCallback((memberId: string, newDetails: { name: string }) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, name: newDetails.name } : m));
    if (currentUser?.id === memberId && currentUser) {
      setCurrentUser(prev => prev ? ({ ...prev, name: newDetails.name }) : null);
    }
    // In a real app, we'd also need to update names in notifications, posts etc., or better, have normalized data.
    // For this simulation, this is sufficient.
  }, [currentUser?.id]);

  const deleteCurrentUser = useCallback(() => {
    if (!currentUser) return;
    const memberIdToDelete = currentUser.id;
    if (memberIdToDelete === ADMIN_ID) {
      alert("The admin account cannot be deleted.");
      return;
    }

    // Filter out all data related to the user
    const remainingMembers = members.filter(m => m.id !== memberIdToDelete);
    setMembers(remainingMembers);
    
    setEvents(prev => prev.map(e => ({
        ...e,
        availability: e.availability.filter(a => a.memberId !== memberIdToDelete)
    })));
    setBookings(prev => prev.filter(b => b.memberId !== memberIdToDelete));
    setSurveyResponses(prev => prev.filter(sr => sr.memberId !== memberIdToDelete));
    setPosts(prev => prev.filter(p => p.authorId !== memberIdToDelete));
    setLessonBookings(prev => prev.filter(lb => lb.memberId !== memberIdToDelete));
    setGroupMessages(prev => prev.filter(gm => gm.authorId !== memberIdToDelete));
    setGroups(prev => prev.map(g => ({
        ...g,
        memberIds: g.memberIds.filter(id => id !== memberIdToDelete)
    })));
    setLadderPlayers(prev => prev.filter(lp => lp.memberId !== memberIdToDelete));
    setChallenges(prev => prev.filter(c => c.challengerId !== memberIdToDelete && c.challengedId !== memberIdToDelete));
    setPartnerRequests(prev => prev.filter(pr => pr.memberId !== memberIdToDelete));
    setNotifications(prev => prev.filter(n => n.memberId !== memberIdToDelete));
    
    // Clear transactions associated with the current user.
    setTransactions(prev => prev.filter(t => t.memberId !== memberIdToDelete));

    // Set a new current user
    if (remainingMembers.length > 0) {
        // Find the index of the deleted user to select the next one logically
        const deletedUserIndex = members.findIndex(m => m.id === memberIdToDelete);
        const nextUserIndex = Math.max(0, deletedUserIndex -1);
        setCurrentUser(remainingMembers[nextUserIndex] || remainingMembers[0]);
    } else {
        alert("Last member deleted. App is now in a demo state.");
        // Handle no users left state if necessary
    }
    
  }, [currentUser, members]);

  const login = useCallback((memberId: string) => {
    const user = members.find(m => m.id === memberId) || null;
    setCurrentUser(user);
    saveToStorage('currentUser', user);
  }, [members]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    clearStorage('currentUser');
  }, []);

  return { 
      members, events, currentUser, updateAvailability, courts, bookings, addBooking, 
      surveys, surveyResponses, submitSurveyResponse, posts, addPost, coaches, lessonBookings, 
      addLessonBooking, groups, groupMessages, sendGroupMessage,
      ladderPlayers, challenges, issueChallenge, respondToChallenge, reportMatchResult,
      partnerRequests, addPartnerRequest, closePartnerRequest,
      announcements, addAnnouncement, ADMIN_ID,
      notifications, markNotificationsAsRead,
      transactions, payForBooking, payForLessonBooking, awardCredits,
      learningArticles,
      toggleNtfConsent, syncWithNtf, ntfSyncStatus,
      agreeToPolicies, updateMemberDetails, deleteCurrentUser,
      createGroup, updateGroup, deleteGroup, moveMemberToGroup,
      login, logout
  };
};