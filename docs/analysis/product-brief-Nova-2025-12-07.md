---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: []
workflowType: 'product-brief'
lastStep: 5
project_name: 'Nova'
user_name: 'Todd'
date: '2025-12-07'
---

# Product Brief: Nova

**Date:** 2025-12-07
**Author:** Todd

---

## Executive Summary

Nova is a custom CRM built specifically for INNOVAAS's sales operations, designed to streamline LinkedIn-centric sales workflows with AI-powered relationship intelligence. By eliminating expensive enterprise CRM subscriptions and building exactly what INNOVAAS needs, Nova delivers modern CRM capabilities tailored to how INNOVAAS actually sells - through LinkedIn Sales Navigator connections, relationship nurturing, and data-driven pipeline management.

---

## Core Vision

### Problem Statement

INNOVAAS needs CRM capabilities to manage sales leads, track pipeline value, and nurture customer relationships, but enterprise solutions like Salesforce and HubSpot are cost-prohibitive for an internal tool. Additionally, existing CRMs aren't optimized for LinkedIn-first sales workflows, requiring manual data entry and providing limited intelligence about relationship health across scattered communication channels (LinkedIn, email, WhatsApp).

### Problem Impact

Without a proper CRM system, INNOVAAS faces:
- Manual tracking of leads across spreadsheets or disconnected tools
- No visibility into pipeline value and deal progression
- Inability to prioritize leads based on engagement signals
- Lost opportunities due to missed warning signs in customer communications
- Time wasted on administrative tasks instead of selling

### Why Existing Solutions Fall Short

- **Cost Barrier**: Enterprise CRMs like Salesforce and HubSpot require expensive per-user subscriptions that don't justify the ROI for internal use
- **LinkedIn Integration Gap**: Generic CRMs don't seamlessly integrate with LinkedIn Sales Navigator workflows, forcing manual data transfer
- **No Relationship Intelligence**: Traditional CRMs track activities but don't analyze sentiment or predict relationship trajectory
- **Over-Engineering**: Enterprise solutions include massive feature sets that INNOVAAS doesn't need, adding complexity without value

### Proposed Solution

Nova is a purpose-built CRM for INNOVAAS that combines:
- **LinkedIn-First Workflow**: Streamlined lead capture from Sales Navigator into CRM (semi-automated within LinkedIn's guidelines)
- **AI Sentiment Analysis**: Continuous analysis of email, WhatsApp, and LinkedIn conversations (via screenshots) to predict relationship health and deal momentum
- **Modern Pipeline Management**: Standard CRM capabilities including deal stages, value tracking, probability scoring, and campaign attribution
- **Web Intelligence**: Automated lead monitoring across media channels to surface conversation opportunities
- **Integrated Communications**: Direct Outlook email integration with activity tracking
- **Visual Dashboard**: Real-time pipeline value, lead counts, and performance metrics

### Key Differentiators

1. **Cost-Effective Ownership**: One-time development cost vs. ongoing enterprise subscriptions, with full control and customization capability
2. **LinkedIn-Native**: Built around how INNOVAAS actually sells (LinkedIn connections first), not retrofitted integrations
3. **AI Relationship Intelligence**: Proactive sentiment analysis that predicts deal trajectory before relationships cool
4. **Exactly What You Need**: No bloat, no unused features - just modern CRM essentials built for INNOVAAS workflows
5. **Tech Stack for Growth**: Built on Next.js, Vercel, and Supabase for easy iteration and feature expansion over time

---

## Target Users

### Primary Users

**INNOVAAS Sales Team Members (3-5 people)**

The INNOVAAS sales team consists of 3-5 people who all participate in the sales process. Each team member:

- **Daily Role**: Actively prospect on LinkedIn Sales Navigator, nurture relationships across multiple channels (LinkedIn, email, WhatsApp), and move deals through the pipeline
- **Collaboration Style**: Full transparency - everyone sees all leads, deals, and pipeline activity to coordinate efforts and avoid duplicate outreach
- **Technical Comfort**: Comfortable with web applications; need simple, efficient workflows to minimize admin time and maximize selling time
- **Key Workflows**:
  - Morning: Log into Nova to review new leads, check AI sentiment alerts, and plan daily outreach
  - Throughout day: Log new LinkedIn connections, track conversations, update deal stages
  - Decision moments: Use AI insights to prioritize which leads need immediate attention
  - Deal closure: When deal closes, review next steps and trigger handoff to project management (ClickUp integration)

### Secondary Users

**N/A** - Given the small team size (3-5 people), there are no distinct secondary user roles. All users have full access and visibility to support collaborative sales efforts.

### User Journey

**1. Onboarding**
- Team receives login credentials for Nova
- Simple, intuitive interface allows immediate productivity without extensive training
- First login shows dashboard with current pipeline state

**2. Daily Workflow - Command Center**
- **Morning**: Log into Nova as first task of the day
  - Review dashboard: new leads added, deals moving forward, orders closed
  - Check AI sentiment alerts: "⚠️ 3 leads showing declining engagement"
  - Plan day's priorities based on pipeline insights
- **Throughout Day**:
  - New LinkedIn connection → Quickly add to Nova with campaign attribution
  - Email/WhatsApp conversations → Upload to lead profile for AI analysis
  - Deal progression → Update stage, value, probability with minimal clicks
- **Deal Closure**:
  - Mark deal as "Closed/Won"
  - Review "Next Steps" for order fulfillment
  - Nova triggers API integration to create project in ClickUp for delivery team

**3. The "Aha!" Moment**
- Week 2 of using Nova: AI sentiment analysis flags a major deal as "cooling off" based on email tone
- Team member reaches out proactively, re-engages the lead, saves the deal
- Realization: "We would have lost this without Nova's intelligence"

**4. Long-Term Adoption**
- Nova becomes indispensable as central coordination hub
- Team can't imagine going back to scattered spreadsheets and manual tracking
- The seamless handoff from sales (Nova) to delivery (ClickUp) eliminates dropped balls
- Daily planning starts with "What does Nova show us today?"

**5. Integration & Expansion**
- **API Connectivity**: RESTful APIs allow Nova to integrate with external tools
- **MCP Integration**: Model Context Protocol (MCP) server support enables flexible, modern connections to various tools and services
- Future integrations possible: Marketing tools, accounting systems, customer success platforms
- Nova evolves from CRM to central business intelligence hub

---

## Success Metrics

For Nova as an internal tool serving INNOVAAS's sales team, success is defined by practical utility and adoption:

**Team Adoption**
- All 3-5 sales team members actively use Nova daily
- Nova becomes the first place team checks each morning for pipeline status
- Team prefers Nova over reverting to spreadsheets or manual tracking

**Core Functionality**
- Lead capture from LinkedIn works reliably
- AI sentiment analysis provides actionable insights
- Pipeline dashboard accurately reflects current state
- Integrations with Outlook and ClickUp function smoothly

**Value Creation**
- Time saved: Less manual data entry and administrative overhead
- Better decisions: AI insights help prioritize which leads need attention
- Improved coordination: Team visibility eliminates duplicate outreach
- Faster handoffs: Smooth transition from closed deals to ClickUp projects

**Sustainability**
- System is stable and reliable for daily use
- Can be maintained and enhanced as INNOVAAS's needs evolve
- Technical debt remains manageable over time

**Bottom Line**: If the team uses it daily, finds it useful, and wouldn't want to go back to the old way - Nova is successful.

---

## MVP Scope

### Core Features (Version 1.0)

**1. User Authentication & Access Control**
- Secure login system for 3-5 INNOVAAS team members
- Individual user accounts with shared visibility to all leads and deals
- Session management and password security

**2. LinkedIn Lead Capture**
- Manual lead entry form to capture new LinkedIn Sales Navigator connections
- Required fields: Name, Company, LinkedIn Profile URL, Contact Information
- Campaign attribution: Associate each lead with a specific outreach campaign
- Lead source tracking

**3. Pipeline Management**
- Create and manage leads with complete profile information
- Customizable sales stages (e.g., "Initial LinkedIn Connect", "First Conversation", "Email Engaged", "Meeting Scheduled", "Proposal Sent", "Negotiation", "Closed Won/Lost")
- Lead assignment and ownership tracking
- Activity timeline for each lead

**4. Deal Tracking & Metrics**
- Deal value estimation (dollar amount)
- Win probability percentage (0-100%)
- Current stage indicator
- Expected close date
- Notes and conversation summaries

**5. Pipeline Dashboard**
- Real-time pipeline value overview
- Lead count by stage
- Deals at risk (e.g., stalled for X days)
- Recently closed deals (won/lost)
- Team activity summary

**6. Outlook Email Integration**
- Click-to-email button that opens Outlook with pre-filled recipient
- Email activity logging (manual entry of sent emails)
- Email history tracking per lead

### Out of Scope for MVP

**Deferred to V2:**
- AI sentiment analysis of conversations
- ClickUp API integration for deal handoff
- Automated conversation upload (email, WhatsApp, LinkedIn)
- Web scraping for lead intelligence

**Deferred to V3+:**
- MCP server integration
- Advanced reporting and analytics
- Marketing automation integrations
- Mobile app

### MVP Success Criteria

**Adoption Metrics:**
- All 3-5 team members have accounts and log in at least once
- Daily active usage within first week of launch
- Team demonstrates preference for Nova over previous methods

**Functional Validation:**
- Lead capture workflow takes <2 minutes per new LinkedIn connection
- Dashboard loads in <3 seconds
- Zero critical bugs in core workflows after first week
- Outlook integration works reliably

**Business Impact:**
- Team can answer "What's our current pipeline value?" instantly
- Eliminated duplicate outreach through shared visibility
- Reduced time spent on manual tracking by at least 30%

### Future Vision

**Version 2.0 (AI-Powered Insights)**
- AI sentiment analysis of email, WhatsApp, and LinkedIn conversations
- Automated lead health scoring and risk alerts
- ClickUp integration for seamless sales-to-delivery handoff
- Conversation history upload and analysis

**Version 3.0 (Intelligence Hub)**
- MCP server support for extensible integrations
- Web scraping for proactive lead intelligence
- Advanced analytics and forecasting
- Marketing campaign attribution tracking

**Long-Term Vision (Business Intelligence Platform)**
- Nova evolves from CRM to central business intelligence hub
- Integrations with accounting, customer success, and operations tools
- Predictive analytics for revenue forecasting
- Mobile and API-first architecture for maximum flexibility

---
