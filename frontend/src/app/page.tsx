"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";

// ... (keep all the dummy data constants) ...

export default function Home() {
  // ... (keep all the state and refs) ...
  const dummyNotifications = [
    { id: 1, text: "Claim CLM-001 was updated by agent. Please review the changes.", time: "2h ago", unread: true },
    { id: 2, text: "New document uploaded by customer in regards to the cliam 002. Pending approval.", time: "5h ago", unread: true },
    { id: 3, text: "Weekly report is ready. Please review the report.", time: "1d ago", unread: false },
  ];
  const dummyClaims = [
    { id: 1, name: "CLM-001", status: "Pending", priority: "High", date: "2024-01-01" },
    { id: 2, name: "CLM-002", status: "Approved", priority: "Medium", date: "2024-01-02" },
    { id: 3, name: "CLM-003", status: "Rejected", priority: "Low", date: "2024-01-03" },
    { id: 4, name: "CLM-004", status: "Pending", priority: "High", date: "2024-01-04" },
  ];
  const dummyStatus = [
    { id: 1, name: "Pending", value: 25, color: "#FFA726" },
    { id: 2, name: "Approved", value: 45, color: "#66BB6A" },
    { id: 3, name: "Rejected", value: 15, color: "#EF5350" },
    { id: 4, name: "In Review", value: 10, color: "#42A5F5" },
    { id: 5, name: "On Hold", value: 5, color: "#AB47BC" }
  ]
  const dummyWorkflow = [
    { id: 1, title: "Total Claims", value: 120, trend: "up", trendValue: 15 },
    { id: 2, title: "Average Resolution Time", value: "1.5 days", trend: "down", trendValue: 0.5 },
    { id: 3, title: "Claim Completion Rate", value: "85%", trend: "up", trendValue: 5 },
    { id: 4, title: "Daily Claims", value: 10, trend: "up", trendValue: 15 },
    { id: 5, title: "Weekly Claims", value: 45, trend: "up", trendValue: 15 },
    { id: 6, title: "Monthly Claims", value: 100, trend: "up", trendValue: 15 },
  ];


  const dummyAnalyticsChart = [{ monday: 100, tuesday: 120, wednesday: 110, thursday: 130, friday: 140, saturday: 150, sunday: 160 }]

  const [activeSection, setActiveSection] = useState("dashboard");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatSessionId, setChatSessionId] = useState("");

  const [chatMessages, setChatMessages] = useState([
    { from: "bot", text: "Hi! How can I help you with your claim today?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);

  // Close dropdowns on outside click
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setChatSessionId(Math.random().toString(36).substring(2, 15));
  }, []);

  // Chatbot send
  function handleChatSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(msgs => [...msgs, { from: "user", text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${chatSessionId}`);
    console.log(ws);
    ws.onopen = () => {
      console.log("open");
      ws.send(JSON.stringify({ message: chatInput }));
    };

    ws.onmessage = (event) => {
      console.log("message");
      const data = JSON.parse(event.data);
      setChatMessages(msgs => [...msgs, { 
        from: "bot", 
        text: data.message, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
      console.log("message", data.message);
      ws.close();
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setChatMessages(msgs => [...msgs, { 
        from: "bot", 
        text: "Sorry, I encountered an error. Please try again.", 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
      console.log("error", error);
    };
    setChatInput("");
    handleChatOpen();
  }

  // Scroll chatbox to focus on new response
  useEffect(() => {
    const chatMessages = document.querySelector(`.${styles.chatbotMessages}`);
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }, [chatMessages]);

  // Handle chatbot open
  function handleChatOpen() {
    setChatOpen(true);
  }

  // Handle chatbot close
  function handleChatClose() {
    setChatOpen(false);
  }

  // Handle section change  
  return (
    <div className={styles.appRoot}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span style={{ color: '#4f8cff', fontSize: 24, fontWeight: 700 }}>Claim</span>
          <span style={{ color: '#f9ca24', fontSize: 24, fontWeight: 700 }}>Pilot</span>
        </div>
        <nav className={styles.navLinks}>
          <a className={styles.active} href="#dashboard">
            <span style={{ color: '#4f8cff' }}>📊</span> Dashboard

          </a>
          <a href="#claims">
            <span style={{ color: '#4f8cff' }}>📝</span> Claims
          </a>
          <a href="#analytics">
            <span style={{ color: '#4f8cff' }}>📈</span> Analytics
          </a>
          <a href="#documents">
            <span style={{ color: '#4f8cff' }}>📁</span> Documents
          </a>
          <a href="#communication">
            <span style={{ color: '#4f8cff' }}>💬</span> Communication
          </a>
          <a href="#settings">
            <span style={{ color: '#4f8cff' }}>⚙️</span> Settings
          </a>
        </nav>
      </aside>
      <div className={styles.mainArea}>
        <header className={styles.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: 'linear-gradient(135deg, #4f8cff 0%, #6c5ce7 100%)', padding: '8px 16px', borderRadius: 8, color: '#fff', fontWeight: 600 }}>
              Welcome Back!
            </div>
            <input className={styles.searchBar} type="text" placeholder="Search..." aria-label="Global search" />
          </div>
          {/* ... (keep the rest of the header) ... */
            <div className={styles.topbarRight}>
              <button className={styles.notificationBtn} aria-label="Notifications">🔔</button>
              <div className={styles.profileDropdown}>
                <img className={styles.profilePic} src="https://api.dicebear.com/7.x/avataaars/svg?seed=agent" alt="Profile" />
                <span className={styles.profileName}>Agent</span>
              </div>
            </div>
          }

        </header>
        <main className={styles.dashboardContent}>
          <div style={{ background: 'linear-gradient(135deg, #4f8cff 0%, #6c5ce7 100%)', padding: '24px 32px', borderRadius: 16, marginBottom: 24, color: '#fff' }}>
            <h1 style={{ fontSize: 28, margin: 0, marginBottom: 8 }}>Welcome to Your Command Center</h1>
            <p style={{ margin: 0, opacity: 0.9 }}>Track, manage, and optimize your claims workflow</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            {/* Analytics Section */}
            <section className={styles.dashboardSection}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 24, color: '#4f8cff' }}>📈</span>
                <h2 style={{ margin: 0 }}>Performance Insights</h2>
              </div>
              {
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 2, background: '#4f8cff' }}></div>
                      <span style={{ fontSize: 14, color: '#666' }}>Claims Volume</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 2, background: '#00b894' }}></div>
                      <span style={{ fontSize: 14, color: '#666' }}>Resolution Rate</span>
                    </div>
                  </div>
                  <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '0 8px' }}>
                    {dummyAnalyticsChart[0] && Object.entries(dummyAnalyticsChart[0]).map(([day, value]) => (
                      <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: '100%', display: 'flex', gap: 2 }}>
                          <div style={{
                            width: '50%',
                            height: `${(value as number) * 0.8}px`,
                            background: '#4f8cff',
                            borderRadius: '4px 4px 0 0'
                          }}></div>
                          <div style={{
                            width: '50%',
                            height: `${(value as number) * 0.6}px`,
                            background: '#00b894',
                            borderRadius: '4px 4px 0 0'
                          }}></div>
                        </div>
                        <span style={{ fontSize: 12, color: '#666', textTransform: 'capitalize' }}>{day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              }
            </section>

            {/* Status Overview Section */}
            <section className={styles.dashboardSection}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 24, color: '#4f8cff' }}>🎯</span>
                <h2 style={{ margin: 0 }}>Status Overview</h2>
              </div>
              <div className={styles.statusGrid}>
                {
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: 200, height: 200, position: 'relative' }}>
                      <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                        {dummyStatus.map((status, index) => {
                          const total = dummyStatus.reduce((acc, curr) => acc + curr.value, 0);
                          const percentage = (status.value / total) * 100;
                          const startAngle = index === 0 ? 0 :
                            dummyStatus.slice(0, index).reduce((acc, curr) => acc + (curr.value / total) * 360, 0);
                          const endAngle = startAngle + (percentage * 3.6);

                          const x1 = 50 + 40 * Math.cos(startAngle * Math.PI / 180);
                          const y1 = 50 + 40 * Math.sin(startAngle * Math.PI / 180);
                          const x2 = 50 + 40 * Math.cos(endAngle * Math.PI / 180);
                          const y2 = 50 + 40 * Math.sin(endAngle * Math.PI / 180);

                          const largeArcFlag = percentage > 50 ? 1 : 0;

                          return (
                            <path
                              key={status.name}
                              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                              fill={status.color}
                              stroke="white"
                              strokeWidth="1"
                            />
                          );
                        })}
                      </svg>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {dummyStatus.map((status) => (
                        <div key={status.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 12, height: 12, borderRadius: 2, background: status.color }}></div>
                          <span style={{ fontSize: 14, color: '#666' }}>{status.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              </div>
            </section>

            {/* Claims Management Center */}
            <section className={styles.dashboardSection}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 24, color: '#4f8cff' }}>📋</span>
                <h2 style={{ margin: 0 }}>Active Claims</h2>
              </div>
              <div className={styles.claimsTable}>
                <div className={styles.tableWrapper}>
                  <table className={styles.claimsTable}>
                    <thead>
                      <tr>
                        <th>Claim ID</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dummyClaims.map((claim) => (
                        <tr key={claim.id} className={styles.tableRow}>
                          <td className={styles.tableCell}>{claim.name}</td>
                          <td className={styles.tableCell}>
                            <span className={`${styles.statusBadge} ${styles[claim.status.toLowerCase()]}`}>
                              {claim.status}
                            </span>
                          </td>
                          <td className={styles.tableCell}>
                            <span className={`${styles.priorityBadge} ${styles[claim.priority.toLowerCase()]}`}>
                              {claim.priority}
                            </span>
                          </td>
                          <td className={styles.tableCell}>{claim.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Claims Workflow */}
            <section className={styles.dashboardSection}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 24, color: '#4f8cff' }}>🔄</span>
                <h2 style={{ margin: 0 }}>Workflow Progress</h2>
              </div>
              <div className={styles.workflowGrid}>
                {dummyWorkflow.map((item) => (
                  <div key={item.id} className={styles.workflowCard}>
                    <h3>{item.title}</h3>
                    <div className={styles.workflowValue}>
                      <span className={styles.value}>{item.value}</span>
                      <span className={`${styles.trend} ${styles[item.trend]}`}>
                        {item.trend === 'up' ? '↑' : '↓'} {item.trendValue}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Claims Documentation */}
            <section className={styles.dashboardSection}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 24, color: '#4f8cff' }}>📚</span>
                <h2 style={{ margin: 0 }}>Document Library</h2>
              </div>
              {/* ... (keep the documentation content) ... */}
            </section>

            {/* Claims Communication */}
            <section className={styles.dashboardSection}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 24, color: '#4f8cff' }}>💌</span>
                <h2 style={{ margin: 0 }}>Messages</h2>
              </div>
              {
                <div className={styles.messagesContainer}>
                  {dummyNotifications.map((notification) => (
                    <div key={notification.id} className={styles.messageItem}>
                      <span className={styles.messageText}>{notification.text}</span>
                      <span className={styles.messageTime}>{notification.time}</span>
                    </div>
                  ))}
                </div>
              }
            </section>
          </div>
        </main>
      </div>
      <div className={styles.chatbotWidget}>
        <div className={styles.chatbotAvatar} onClick={handleChatOpen}>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=agent" alt="Chatbot" />
        </div>
        {chatOpen && (
          <div className={styles.chatbotWindow}>
            <div className={styles.chatbotHeader}>
              <h3>ClaimBuddy.ai <span style={{ fontSize: 12, color: '#666' }}>v1.0.0</span></h3>
              <span className={styles.chatbotStatus}>Online</span>
              <div className={styles.poweredBy}>
                <span>powered by</span>
                <img src="/openai-logo.svg" alt="OpenAI"/>
                <span style={{ fontSize: 10, color: '#666', verticalAlign: 'sub' }}>OpenAI</span>
              </div>
              <button className={styles.closeChat} onClick={handleChatClose}>✕</button>
            </div>
            <div className={styles.chatbotMessages}>
              {chatMessages.map((message, index) => (
                <div key={index} className={`${styles.message} ${styles[message.from]}`}>
                  <div className={styles.messageContent}>
                    <div className={styles.messageText}>{message.text}</div>
                    <div className={styles.messageTime}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleChatSend} className={styles.chatbotInput}>
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className={styles.chatInput}
              />
              <button type="submit" className={styles.sendButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
