---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - "docs/analysis/product-brief-Nova-2025-12-07.md"
workflowType: 'prd'
lastStep: 4
project_name: 'NovaCRM'
user_name: 'Todd'
date: '2025-12-07'
---

# Product Requirements Document - NovaCRM

**Author:** Todd
**Date:** 2025-12-07

## Executive Summary

Nova is a custom CRM platform designed specifically for INNOVAAS's sales operations, eliminating the need for expensive enterprise CRM subscriptions while delivering exactly what the team needs. The platform centers on LinkedIn-first sales workflows, enabling the 3-5 person sales team to capture leads from LinkedIn Sales Navigator, track deals through customizable pipeline stages, and manage relationships across multiple communication channels with complete team visibility.

The core value proposition is threefold: (1) **Cost Efficiency** - one-time development investment versus recurring enterprise subscription costs; (2) **LinkedIn-Native Workflows** - built around how INNOVAAS actually sells rather than forcing the team to adapt to generic CRM patterns; and (3) **Team Collaboration** - full transparency across all leads and deals to eliminate duplicate outreach and maximize coordination.

The MVP focuses on essential CRM capabilities: secure user authentication for the team, manual LinkedIn lead capture with campaign attribution, customizable pipeline management with deal value and probability tracking, a real-time dashboard showing pipeline metrics, and Outlook email integration for streamlined communication. Future versions will introduce AI-powered sentiment analysis of conversations, ClickUp integration for sales-to-delivery handoff, and MCP server support for extensible integrations.

### What Makes This Special

**1. Purpose-Built for INNOVAAS's Sales Model**

Unlike generic CRMs designed for mass-market appeal, Nova is architected specifically around INNOVAAS's LinkedIn-centric sales approach. The platform recognizes that modern B2B sales relationships begin on LinkedIn Sales Navigator, not through cold calls or mass email campaigns. By optimizing the lead capture workflow for LinkedIn connections and building campaign attribution directly into the initial contact flow, Nova eliminates the friction that makes traditional CRMs feel like administrative burdens rather than sales enablement tools.

**2. Cost-Effective Ownership Without Enterprise Overhead**

Enterprise CRMs like Salesforce and HubSpot charge per-user subscription fees that quickly become prohibitive for internal tools, often costing thousands of dollars annually for features the team doesn't need. Nova inverts this model: a focused one-time development investment delivers exactly the capabilities INNOVAAS requires, with full ownership and control. The team isn't paying for bloated feature sets designed for Fortune 500 companies; they're getting modern CRM essentials tailored to a lean, efficient sales operation.

**3. AI Relationship Intelligence (Future Vision)**

While the MVP focuses on core CRM functionality, Nova's roadmap includes AI-powered sentiment analysis that will analyze conversations across email, WhatsApp, and LinkedIn (via screenshot uploads) to predict relationship health and deal momentum. This proactive intelligence will surface warning signs like declining engagement or shifting sentiment before deals cool off, enabling the team to intervene strategically rather than react to lost opportunities. This capability transforms Nova from a tracking system into a relationship intelligence platform.

**4. Seamless Tech Stack for Iteration**

Built on Next.js, Vercel, and Supabase, Nova leverages modern, developer-friendly technologies that enable rapid iteration and feature expansion. Unlike legacy enterprise systems locked into proprietary architectures, Nova can evolve with INNOVAAS's needs - adding integrations, expanding analytics, or introducing new workflows without vendor lock-in or prohibitive customization costs.

## Project Classification

**Technical Type:** SaaS B2B Platform
**Domain:** General Business Software
**Complexity:** Low to Medium

This is a web-based SaaS application with multi-user collaboration requirements, role-based access, and third-party integrations. The technical architecture follows established patterns for modern web applications (Next.js for the frontend/backend, Supabase for database and authentication, Vercel for hosting), which reduces architectural risk and accelerates development.

The project classification as "general business software" indicates standard security and privacy requirements without specialized regulatory compliance (no HIPAA, PCI DSS, or FDA constraints). This allows the development to focus on user experience and business logic rather than complex compliance frameworks.

Key technical considerations include:
- **Multi-tenant architecture:** Each INNOVAAS team member has individual authentication but shared visibility to all data
- **Third-party integrations:** Outlook email (MVP), future ClickUp integration for sales-to-delivery handoff
- **Real-time updates:** Dashboard metrics and pipeline state should reflect current data
- **Data security:** Protect sensitive customer information and sales pipeline data
- **Scalability:** Architecture should support INNOVAAS's growth without major refactoring

## Success Criteria

### User Success

Nova succeeds when INNOVAAS sales team members (3-5 people) adopt it as their central command center for daily sales operations. Success manifests in three key behaviors:

**Daily Adoption as Primary Tool**
- Nova becomes the first application team members open each morning to review pipeline status, new leads, and AI sentiment alerts
- Team members instinctively turn to Nova when asking "What's the current state of our pipeline?" rather than checking spreadsheets or asking colleagues
- The platform is perceived as a sales enablement tool rather than an administrative burden

**Workflow Efficiency**
- Lead capture from LinkedIn takes less than 2 minutes per connection, making it frictionless enough that team members log every new LinkedIn contact without resistance
- Dashboard loads in under 3 seconds, providing instant visibility into pipeline metrics without waiting or frustration
- Email integration with Outlook works seamlessly, eliminating context-switching between tools

**Team Coordination Breakthrough**
- The "aha!" moment occurs when a team member avoids duplicate outreach because Nova showed a colleague already contacted that lead - eliminating embarrassment and improving professionalism
- Team members feel confident and empowered knowing the complete state of customer relationships at any moment
- Collaboration improves because everyone has shared visibility into who's working which leads and what stage each deal is in

### Business Success

For Nova as an internal tool, business success is defined by practical utility rather than traditional SaaS metrics. The investment succeeds when:

**At 1 Month (Adoption Milestone):**
- All 3-5 team members have created accounts and logged in at least once
- Team demonstrates active daily usage rather than reverting to old spreadsheet methods
- Zero critical bugs in core workflows (lead capture, pipeline management, dashboard viewing)

**At 6 Months (Value Realization):**
- Manual tracking time reduced by at least 30% compared to previous methods
- Team can instantly answer "What's our current pipeline value?" without calculations or data gathering
- Duplicate outreach incidents eliminated through shared visibility
- Team consensus that Nova has become indispensable to their workflow

**Long-Term Sustainability:**
- System remains stable and reliable for daily use without frequent technical issues
- Nova can be maintained and enhanced as INNOVAAS's needs evolve
- Technical debt remains manageable, allowing future feature development

**The Bottom Line:** If the team uses Nova daily, finds it genuinely useful, and would resist going back to the old way of working - Nova has succeeded. This is fundamentally about adoption and utility, not vanity metrics.

### Technical Success

**Performance Requirements:**
- Dashboard page loads in under 3 seconds on standard broadband connections
- Lead capture form submission completes in under 2 seconds
- Database queries for pipeline views execute in under 1 second
- System maintains 99% uptime during business hours (9am-6pm, Monday-Friday)

**Reliability Standards:**
- Zero data loss incidents (all lead and deal data is durably persisted)
- Outlook email integration functions reliably without broken mailto links or missing data
- Authentication system prevents unauthorized access while maintaining smooth login experience for authorized team members
- Real-time dashboard updates reflect current pipeline state without requiring manual page refreshes

**Maintainability Goals:**
- Codebase follows established Next.js and React patterns for easy future development
- Supabase database schema is well-documented and normalized
- System architecture supports adding new features (AI sentiment, ClickUp integration) without major refactoring
- Technical debt is actively managed to prevent accumulation

### Measurable Outcomes

**Adoption Metrics:**
- 100% of INNOVAAS sales team (3-5 people) have active accounts within first week
- Daily active usage rate of 80%+ within first month
- Team logs an average of 5+ lead interactions per day (creates, updates, stage changes)

**Efficiency Metrics:**
- Lead capture workflow: <2 minutes from LinkedIn connection to Nova entry
- Dashboard load time: <3 seconds
- Time spent on manual tracking: 30% reduction vs. previous methods
- Duplicate outreach incidents: Zero (tracked over 90-day period)

**Quality Metrics:**
- Critical bugs in core workflows: Zero after first week of production use
- User-reported issues requiring immediate attention: <1 per week
- Data integrity: 100% (no lost or corrupted lead/deal records)

**Business Impact:**
- Pipeline visibility: Team can answer "current pipeline value" instantly (measured by response time <10 seconds)
- Coordination improvement: Team reports improved collaboration in weekly feedback
- Return to old methods: Zero team members request to revert to spreadsheets after 30 days

## Product Scope

### MVP - Minimum Viable Product

The MVP delivers core CRM functionality focused on LinkedIn-first workflows and team collaboration. This represents the essential feature set required for the team to adopt Nova as their primary sales tool.

**1. User Authentication & Access Control**
- Secure login system for 3-5 INNOVAAS team members using Supabase Auth
- Individual user accounts with email/password authentication
- Shared visibility to all leads and deals (no restrictive permissions in MVP)
- Session management and secure logout functionality

**2. LinkedIn Lead Capture**
- Manual lead entry form to capture new LinkedIn Sales Navigator connections
- Required fields: Name, Company, LinkedIn Profile URL, Contact Information (email, phone)
- Campaign attribution: Associate each lead with a specific outreach campaign (dropdown selection)
- Lead source tracking (LinkedIn Sales Navigator, referral, other)
- Timestamps for creation and last update

**3. Pipeline Management**
- Create and manage lead records with complete profile information
- Customizable sales stages (configurable by team):
  - Default stages: "Initial LinkedIn Connect", "First Conversation", "Email Engaged", "Meeting Scheduled", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost"
- Lead assignment and ownership tracking (which team member owns each lead)
- Activity timeline for each lead showing stage changes, notes added, and key interactions
- Editable lead notes and conversation summaries

**4. Deal Tracking & Metrics**
- Deal value estimation (dollar amount field)
- Win probability percentage (0-100% slider or input)
- Current stage indicator (visual representation in pipeline)
- Expected close date (date picker)
- Notes and conversation summaries (rich text field)
- Deal history tracking (who changed what, when)

**5. Pipeline Dashboard**
- Real-time pipeline value overview (sum of deal values weighted by probability)
- Lead count by stage (visual funnel or kanban view)
- Deals at risk (stalled for X days without activity - configurable threshold)
- Recently closed deals (won/lost in last 30 days)
- Team activity summary (leads added, deals moved this week)
- Quick filters: by stage, by owner, by campaign, by date range

**6. Outlook Email Integration**
- Click-to-email button that opens Outlook desktop client or Outlook web with pre-filled recipient email
- Email activity logging: Manual entry of sent emails (subject, date, brief summary)
- Email history tracking per lead (timeline view of all email interactions)
- Simple interface: "Log Email" button on each lead profile

**Out of Scope for MVP:**
- AI sentiment analysis of conversations (deferred to V2.0)
- ClickUp API integration for deal handoff (deferred to V2.0)
- Automated conversation upload from email, WhatsApp, LinkedIn (deferred to V2.0)
- Web scraping for lead intelligence (deferred to V2.0)
- Advanced reporting and analytics beyond basic dashboard (deferred to V3.0+)
- MCP server integration (deferred to V3.0+)
- Mobile app (deferred to V3.0+)

### Growth Features (Post-MVP)

**Version 2.0: AI-Powered Insights**

Once the MVP proves valuable and achieves stable adoption, V2.0 introduces intelligent features that elevate Nova from tracking tool to relationship intelligence platform:

- **AI Sentiment Analysis:** Analyze email, WhatsApp, and LinkedIn conversation content (via screenshot uploads) to predict relationship health and deal momentum
- **Automated Lead Health Scoring:** Continuous scoring of lead engagement based on conversation frequency, sentiment trends, and interaction patterns
- **Risk Alerts:** Proactive notifications when leads show declining engagement or shifting sentiment (e.g., "⚠️ 3 leads showing declining engagement - review recommended")
- **ClickUp Integration:** Seamless sales-to-delivery handoff - when deal marked "Closed Won", automatically create project in ClickUp with deal details and customer information
- **Conversation History Upload:** Upload email threads, WhatsApp screenshots, and LinkedIn message screenshots for AI analysis and centralized relationship context
- **Engagement Timeline:** Visualize relationship trajectory over time with sentiment trends and interaction frequency

**Version 3.0: Intelligence Hub**

After V2.0 demonstrates AI capabilities, V3.0 expands Nova into a comprehensive business intelligence platform:

- **MCP Server Support:** Model Context Protocol integration enables extensible connections to various tools and services (marketing platforms, accounting systems, customer success tools)
- **Web Intelligence:** Automated monitoring of news, social media, and industry publications for lead companies - surface conversation opportunities (e.g., "Your lead's company just announced Series B funding")
- **Advanced Analytics & Forecasting:** Revenue forecasting based on historical win rates, deal velocity analytics, campaign ROI tracking, and predictive pipeline modeling
- **Marketing Campaign Attribution:** Track which campaigns generate highest-quality leads and best conversion rates
- **Mobile App:** iOS/Android apps for on-the-go pipeline visibility and quick lead updates

### Vision (Future)

**Long-Term: Business Intelligence Platform**

Nova evolves from a CRM into INNOVAAS's central business intelligence hub that connects sales, delivery, finance, and operations:

- **Cross-Functional Integration:** Connect Nova to accounting (revenue recognition), customer success (onboarding status), and operations (delivery timelines) for complete business visibility
- **Predictive Revenue Analytics:** Machine learning models predict quarterly revenue based on pipeline health, historical patterns, and external market signals
- **API-First Architecture:** Comprehensive REST/GraphQL APIs enable Nova to become the data backbone for other internal tools
- **Custom Workflows:** No-code workflow builder for INNOVAAS to define custom automation (e.g., "When deal value exceeds $50K, notify VP Sales")
- **Executive Dashboard:** C-level view of business health: revenue trends, pipeline coverage, team performance, customer satisfaction indicators

## User Journeys

### Journey 1: Marcus Chen - From Spreadsheet Chaos to Sales Confidence

Marcus Chen is a 32-year-old sales professional at INNOVAAS, and he's good at what he does best: building relationships on LinkedIn and closing deals. But lately, he's spending more time as a data entry clerk than a salesperson. Every morning starts the same way - 30 minutes updating the shared Google Sheet with yesterday's LinkedIn connections, manually copying contact details, and trying to remember which campaign each lead came from. He's frustrated because he knows two of his teammates reached out to the same prospect last week, creating an awkward situation that damaged INNOVAAS's credibility.

On a Monday morning after a particularly embarrassing duplicate outreach incident, Marcus's manager introduces Nova. Skeptical but willing to try anything, Marcus logs in and sees a clean, simple dashboard. Within 2 minutes, he's added his first LinkedIn connection from that morning - Sarah Kim from TechVentures. The form asks for exactly what he needs: her LinkedIn profile, company, email, and which campaign she came from ("Q4 SaaS Outreach"). No fuss, no fighting with spreadsheet formulas.

The breakthrough comes two weeks later. Marcus is about to send a connection request to James Park, CEO of a promising startup. He searches Nova first - and there it is: his teammate Lisa already connected with James three days ago and has a meeting scheduled. Marcus feels relief wash over him. He thanks Lisa via Slack, coordinates their approach, and they decide Marcus will handle a different contact at the same company. What could have been another embarrassing moment became a coordinated team effort.

Three months in, Marcus can't imagine going back. Every morning, he opens Nova first - checking which leads moved forward, which deals are stalling, and what the pipeline value looks like. When his manager asks "What's our pipeline worth right now?", Marcus answers in 5 seconds: "$247,000 with 68% weighted probability." He's spending 30% less time on admin work and 30% more time actually selling. Nova isn't just a tool - it's become his sales command center.

### Journey 2: Sarah Rodriguez - The Reluctant Admin Who Found Her Power

Sarah Rodriguez never wanted to be the "CRM admin" - she's a salesperson first. But as the most tech-savvy member of INNOVAAS's small sales team, she inherited the responsibility when the team outgrew their shared spreadsheet. Every week, someone asks her to add a new campaign name to the dropdown, adjust the sales stages, or explain why the pipeline calculations don't match what they expect. She's constantly editing the Google Sheet structure while trying to avoid breaking everyone else's work.

When INNOVAAS launches Nova, Sarah is both hopeful and anxious. She's been designated the admin, which means she'll need to configure everything - and if it's complicated, she'll be the one fielding frustrated questions from the team. She logs into Nova's admin panel, expecting complexity, but finds something surprisingly straightforward: a settings page where she can manage sales stages, campaign names, and user accounts.

Her first task is setting up the sales stages. She types in INNOVAAS's process: "Initial LinkedIn Connect", "First Conversation", "Email Engaged", "Meeting Scheduled", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost". She can drag to reorder them, edit names on the fly, and even archive old stages that are no longer used. No spreadsheet formulas to protect, no cells to lock - just clean configuration.

The turning point comes when Marcus asks her to add a new campaign called "Winter 2025 Enterprise Push." In the old world, this meant editing the spreadsheet, making sure the dropdown referenced the right cells, and hoping nobody's in-progress entries got corrupted. In Nova, Sarah clicks "Add Campaign", types the name, and it's live in 10 seconds. Marcus confirms it appeared in his dropdown immediately. Sarah feels empowered rather than burdened.

Six months later, Sarah has evolved from reluctant admin to system steward. She regularly checks Nova's admin dashboard to see team activity, adjusts settings as INNOVAAS's sales process evolves, and onboards new team members in under 15 minutes. When the CEO asks about adding a new salesperson, Sarah confidently says "I can have them set up and trained in Nova within a day." She's no longer the bottleneck - she's the enabler.

### Journey 3: David Okonkwo - The Investor Who Finally Sees the Truth

David Okonkwo is a Series A investor and board member at INNOVAAS. He believes in the team and the vision, but every board meeting feels like pulling teeth to understand the real state of the sales pipeline. The sales team shares a Google Sheet during quarterly reviews, but David has learned to be skeptical. Are these numbers current? How many deals are actually progressing versus sitting stale? What's the realistic pipeline value when you account for probability? He asks pointed questions, but without real-time visibility, he's always wondering if he's getting the full story.

When INNOVAAS implements Nova, the CEO creates a view-only account for David with the role "Executive Dashboard." David is immediately skeptical - another tool, another set of numbers that might not match reality. But curiosity wins, and he logs in on a Tuesday morning before his coffee call with the CEO.

What he sees changes everything. The dashboard shows $247,000 in pipeline value, but it's not just a number - it's broken down by stage, by team member, by campaign. He can see that 12 deals are in "Proposal Sent" stage, 8 in "Meeting Scheduled", and 3 in "Negotiation." There's a "Deals at Risk" section showing 4 leads that haven't had activity in 21+ days. This isn't a static snapshot prepared for a board meeting - this is the living, breathing truth of INNOVAAS's sales operation.

The "aha!" moment happens during the next board meeting. The CEO starts presenting pipeline updates, and David opens Nova on his laptop. As the CEO talks through the numbers, David can see them reflected in real-time. When the CEO mentions a $45K deal that just moved to "Negotiation" stage, David watches the dashboard update. He's not receiving a report - he's seeing the same reality the sales team sees every day.

Twelve months in, David checks Nova every Monday morning before his week begins. Not to micromanage, but to understand INNOVAAS's sales health with the same clarity he monitors his other portfolio companies' metrics. When friends ask him about INNOVAAS's performance, he can speak with confidence rooted in data. When the CEO proposes hiring two more salespeople, David can pull up Nova, review pipeline coverage, and make an informed decision. Trust isn't built on reports anymore - it's built on transparency.

### Journey Requirements Summary

These journeys reveal distinct capability requirements for Nova:

**From Marcus (Sales Team Member Journey):**
- **Lead Capture**: Fast, simple form for LinkedIn connections with campaign attribution
- **Duplicate Prevention**: Search/check before outreach to avoid team overlap
- **Pipeline Dashboard**: Real-time visibility into deal stages, values, and team activity
- **Quick Answers**: Instant pipeline value calculations with weighted probability
- **Team Coordination**: See who owns which leads and what stage they're in
- **Daily Command Center**: Dashboard that becomes the first stop each morning

**From Sarah (Admin User Journey):**
- **Sales Stage Configuration**: Easy-to-use interface for managing pipeline stages (add, edit, reorder, archive)
- **Campaign Management**: Simple campaign name management that updates dropdowns immediately
- **User Account Management**: Quick user creation and onboarding (set up new team members in minutes)
- **Admin Dashboard**: Visibility into team activity and system usage
- **Settings Control**: Central configuration panel for system-wide settings
- **No Technical Complexity**: Admin functions that don't require database or spreadsheet expertise

**From David (Executive/View-Only User Journey):**
- **Executive Dashboard**: High-level view optimized for strategic oversight, not operational detail
- **Real-Time Truth**: Current data that reflects the actual state of sales, not prepared reports
- **Pipeline Breakdown**: View deals by stage, team member, campaign for informed decisions
- **Risk Visibility**: Surface deals that are stalling or need attention
- **Read-Only Access**: View everything without ability to edit or create leads (appropriate permission model)
- **Confidence Through Transparency**: Data that builds trust between investors/board and operations
