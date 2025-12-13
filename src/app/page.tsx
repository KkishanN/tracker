import { FaGoogle, FaBook, FaLightbulb, FaRobot, FaFire, FaCheckCircle } from 'react-icons/fa'
import LoginButton from '@/components/LoginButton'

const features = [
  {
    icon: FaBook,
    title: 'Subjects & Chapters',
    description: 'Organize your learning with subjects and break them into manageable chapters'
  },
  {
    icon: FaLightbulb,
    title: 'Concept Intuition',
    description: 'Generate AI-powered summaries to grasp the big picture of each chapter'
  },
  {
    icon: FaRobot,
    title: 'AI Task Generation',
    description: 'Let AI create practice tasks and track your progress automatically'
  },
  {
    icon: FaFire,
    title: 'Streak Tracking',
    description: 'Build consistent study habits with daily streaks and reminders'
  }
]

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background gradients */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '-10%',
        width: '500px',
        height: '500px',
        background: 'rgba(139, 92, 246, 0.15)',
        borderRadius: '50%',
        filter: 'blur(120px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        right: '-10%',
        width: '500px',
        height: '500px',
        background: 'rgba(236, 72, 153, 0.15)',
        borderRadius: '50%',
        filter: 'blur(120px)',
        pointerEvents: 'none'
      }} />

      {/* Hero Section */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '600px',
          marginBottom: '3rem'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(139, 92, 246, 0.2)',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            color: '#8b5cf6',
            marginBottom: '1.5rem'
          }}>
            <FaCheckCircle size={14} />
            <span>AI-Powered Study Tracking</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 700,
            marginBottom: '1rem',
            lineHeight: 1.1
          }}>
            <span className="gradient-text">Unlock Your</span>
            <br />
            <span style={{ color: 'var(--text-main)' }}>Learning Potential</span>
          </h1>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '1.125rem',
            lineHeight: 1.6,
            marginBottom: '2rem'
          }}>
            Track your progress, master your subjects, and build consistent study habits with AI-powered insights and personalized task generation.
          </p>

          <LoginButton />
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          maxWidth: '900px',
          width: '100%'
        }}>
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  textAlign: 'left'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <Icon size={18} style={{ color: '#8b5cf6' }} />
                </div>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: 'var(--text-main)'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5
                }}>
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid var(--border)',
        color: 'var(--text-muted)',
        fontSize: '0.875rem'
      }}>
        <span className="gradient-text" style={{ fontWeight: 600 }}>StudyTracker</span>
        {' '}• Built for focused learners
      </footer>
    </div>
  )
}

