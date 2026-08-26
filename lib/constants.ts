export const SKILLS = [
  { key: "opsManagement", label: "Operations management" },
  { key: "peopleLeadership", label: "People leadership" },
  { key: "projectManagement", label: "Project management" },
  { key: "financialAnalysis", label: "Financial analysis" },
  { key: "budgeting", label: "Budgeting" },
  { key: "cashFlow", label: "Cash-flow management" },
  { key: "sales", label: "Sales" },
  { key: "bizDev", label: "Business development" },
  { key: "marketing", label: "Marketing" },
  { key: "customerService", label: "Customer service" },
  { key: "procurement", label: "Procurement" },
  { key: "supplyChain", label: "Supply chain" },
  { key: "logistics", label: "Logistics" },
  { key: "processImprovement", label: "Process improvement" },
  { key: "techImplementation", label: "Technology implementation" },
  { key: "dataAnalysis", label: "Data analysis" },
  { key: "negotiation", label: "Negotiation" },
  { key: "contractManagement", label: "Contract management" },
  { key: "regulatoryCompliance", label: "Regulatory / compliance management" },
  { key: "recruitment", label: "Recruitment" },
  { key: "performanceManagement", label: "Performance management" },
  { key: "strategy", label: "Strategy" },
  { key: "changeManagement", label: "Change management" },
  { key: "propertyFacilities", label: "Property / facilities management" },
] as const

export type SkillKey = typeof SKILLS[number]['key']

export const SECTOR_DB = [
  { id: "b2b-prof", name: "B2B professional services", recurringRevenue: 4, marginPotential: 4, cashGeneration: 4, capitalIntensity: 1, ownerIndependence: 3, regulatoryIntensity: 2, staffAvailability: 3, growthPotential: 3, financingSuitability: 4, exitPotential: 4, competitiveFragmentation: 4, customerDiversification: 3, techOpportunity: 4, demandResilience: 4, lifestyleDemand: 2, weekendDependent: false, requiredSkills: ["financialAnalysis","sales","bizDev","negotiation","strategy"], blurb: "Advisory, consultancy or agency work sold on expertise and relationships." },
  { id: "facilities", name: "Facilities management", recurringRevenue: 5, marginPotential: 3, cashGeneration: 4, capitalIntensity: 2, ownerIndependence: 3, regulatoryIntensity: 3, staffAvailability: 3, growthPotential: 3, financingSuitability: 4, exitPotential: 3, competitiveFragmentation: 4, customerDiversification: 4, techOpportunity: 2, demandResilience: 5, lifestyleDemand: 3, weekendDependent: false, requiredSkills: ["opsManagement","peopleLeadership","procurement","contractManagement"], blurb: "Contracted building services — often multi-year, recurring contracts." },
  { id: "cleaning", name: "Commercial cleaning", recurringRevenue: 5, marginPotential: 3, cashGeneration: 4, capitalIntensity: 1, ownerIndependence: 3, regulatoryIntensity: 2, staffAvailability: 2, growthPotential: 3, financingSuitability: 4, exitPotential: 3, competitiveFragmentation: 5, customerDiversification: 4, techOpportunity: 2, demandResilience: 5, lifestyleDemand: 3, weekendDependent: false, requiredSkills: ["opsManagement","peopleLeadership","recruitment","performanceManagement"], blurb: "Low-tech, contract-based, staffing is usually the core challenge." },
  { id: "property-services", name: "Property services", recurringRevenue: 4, marginPotential: 3, cashGeneration: 3, capitalIntensity: 2, ownerIndependence: 3, regulatoryIntensity: 3, staffAvailability: 3, growthPotential: 3, financingSuitability: 3, exitPotential: 3, competitiveFragmentation: 4, customerDiversification: 3, techOpportunity: 2, demandResilience: 3, lifestyleDemand: 3, weekendDependent: true, requiredSkills: ["propertyFacilities","opsManagement","contractManagement"], blurb: "Lettings, estate or property maintenance related services." },
  { id: "specialist-maint", name: "Specialist maintenance", recurringRevenue: 4, marginPotential: 3, cashGeneration: 3, capitalIntensity: 2, ownerIndependence: 2, regulatoryIntensity: 3, staffAvailability: 2, growthPotential: 3, financingSuitability: 3, exitPotential: 3, competitiveFragmentation: 3, customerDiversification: 3, techOpportunity: 2, demandResilience: 4, lifestyleDemand: 3, weekendDependent: false, requiredSkills: ["opsManagement","regulatoryCompliance","procurement"], blurb: "Compliance-driven servicing (fire, gas, lifts, plant) — often licence-adjacent." },
  { id: "logistics-support", name: "Logistics support", recurringRevenue: 4, marginPotential: 2, cashGeneration: 3, capitalIntensity: 3, ownerIndependence: 3, regulatoryIntensity: 3, staffAvailability: 2, growthPotential: 3, financingSuitability: 3, exitPotential: 3, competitiveFragmentation: 3, customerDiversification: 3, techOpportunity: 3, demandResilience: 3, lifestyleDemand: 3, weekendDependent: false, requiredSkills: ["logistics","supplyChain","opsManagement","dataAnalysis"], blurb: "Freight forwarding, 3PL or supply-chain services." },
  { id: "courier", name: "Courier / transport", recurringRevenue: 3, marginPotential: 2, cashGeneration: 3, capitalIntensity: 4, ownerIndependence: 2, regulatoryIntensity: 3, staffAvailability: 2, growthPotential: 3, financingSuitability: 3, exitPotential: 2, competitiveFragmentation: 4, customerDiversification: 3, techOpportunity: 3, demandResilience: 3, lifestyleDemand: 4, weekendDependent: true, requiredSkills: ["logistics","opsManagement","recruitment"], blurb: "Owner-driver networks, van fleets or last-mile delivery." },
  { id: "warehousing", name: "Warehousing", recurringRevenue: 4, marginPotential: 3, cashGeneration: 3, capitalIntensity: 4, ownerIndependence: 3, regulatoryIntensity: 2, staffAvailability: 2, growthPotential: 3, financingSuitability: 3, exitPotential: 3, competitiveFragmentation: 3, customerDiversification: 3, techOpportunity: 3, demandResilience: 3, lifestyleDemand: 2, weekendDependent: false, requiredSkills: ["logistics","opsManagement","supplyChain"], blurb: "Storage and fulfilment, often property and capital heavy." },
  { id: "training", name: "Training", recurringRevenue: 3, marginPotential: 4, cashGeneration: 4, capitalIntensity: 1, ownerIndependence: 2, regulatoryIntensity: 3, staffAvailability: 3, growthPotential: 4, financingSuitability: 3, exitPotential: 3, competitiveFragmentation: 4, customerDiversification: 3, techOpportunity: 4, demandResilience: 3, lifestyleDemand: 2, weekendDependent: false, requiredSkills: ["marketing","sales","projectManagement"], blurb: "Accredited or vocational training providers." },
  { id: "compliance", name: "Compliance services", recurringRevenue: 5, marginPotential: 4, cashGeneration: 4, capitalIntensity: 1, ownerIndependence: 3, regulatoryIntensity: 4, staffAvailability: 3, growthPotential: 3, financingSuitability: 4, exitPotential: 4, competitiveFragmentation: 3, customerDiversification: 4, techOpportunity: 3, demandResilience: 5, lifestyleDemand: 2, weekendDependent: false, requiredSkills: ["regulatoryCompliance","financialAnalysis","contractManagement"], blurb: "Audit, certification, health & safety or regulatory advisory work." },
  { id: "recruitment", name: "Recruitment", recurringRevenue: 2, marginPotential: 4, cashGeneration: 4, capitalIntensity: 1, ownerIndependence: 2, regulatoryIntensity: 2, staffAvailability: 3, growthPotential: 3, financingSuitability: 3, exitPotential: 3, competitiveFragmentation: 5, customerDiversification: 3, techOpportunity: 3, demandResilience: 2, lifestyleDemand: 3, weekendDependent: false, requiredSkills: ["sales","negotiation","bizDev","recruitment"], blurb: "Highly cyclical, relationship and sales-led; owner often the top biller." },
  { id: "healthcare-support", name: "Healthcare support", recurringRevenue: 5, marginPotential: 3, cashGeneration: 4, capitalIntensity: 2, ownerIndependence: 2, regulatoryIntensity: 5, staffAvailability: 2, growthPotential: 4, financingSuitability: 3, exitPotential: 3, competitiveFragmentation: 3, customerDiversification: 4, techOpportunity: 2, demandResilience: 5, lifestyleDemand: 4, weekendDependent: true, requiredSkills: ["regulatoryCompliance","peopleLeadership","performanceManagement"], blurb: "CQC-regulated support services — heavy compliance and staffing load." },
  { id: "social-care", name: "Social care", recurringRevenue: 5, marginPotential: 2, cashGeneration: 3, capitalIntensity: 2, ownerIndependence: 2, regulatoryIntensity: 5, staffAvailability: 2, growthPotential: 4, financingSuitability: 2, exitPotential: 3, competitiveFragmentation: 3, customerDiversification: 3, techOpportunity: 2, demandResilience: 5, lifestyleDemand: 5, weekendDependent: true, requiredSkills: ["regulatoryCompliance","peopleLeadership","recruitment"], blurb: "Domiciliary or residential care — demanding, regulated, resilient demand." },
  { id: "childcare", name: "Childcare", recurringRevenue: 4, marginPotential: 2, cashGeneration: 3, capitalIntensity: 3, ownerIndependence: 2, regulatoryIntensity: 5, staffAvailability: 2, growthPotential: 2, financingSuitability: 2, exitPotential: 3, competitiveFragmentation: 3, customerDiversification: 4, techOpportunity: 1, demandResilience: 4, lifestyleDemand: 4, weekendDependent: false, requiredSkills: ["regulatoryCompliance","peopleLeadership","opsManagement"], blurb: "Nursery/childcare provision — Ofsted-regulated, premises-heavy." },
  { id: "it-managed", name: "IT managed services", recurringRevenue: 5, marginPotential: 4, cashGeneration: 4, capitalIntensity: 1, ownerIndependence: 3, regulatoryIntensity: 2, staffAvailability: 2, growthPotential: 4, financingSuitability: 4, exitPotential: 4, competitiveFragmentation: 3, customerDiversification: 3, techOpportunity: 5, demandResilience: 4, lifestyleDemand: 2, weekendDependent: false, requiredSkills: ["techImplementation","opsManagement","contractManagement"], blurb: "MSP contracts billed monthly — often strong recurring revenue." },
  { id: "software-enabled", name: "Software-enabled services", recurringRevenue: 4, marginPotential: 4, cashGeneration: 3, capitalIntensity: 1, ownerIndependence: 2, regulatoryIntensity: 1, staffAvailability: 2, growthPotential: 4, financingSuitability: 3, exitPotential: 4, competitiveFragmentation: 3, customerDiversification: 3, techOpportunity: 5, demandResilience: 3, lifestyleDemand: 2, weekendDependent: false, requiredSkills: ["techImplementation","dataAnalysis","strategy"], blurb: "Services layered with proprietary tools or workflow software." },
  { id: "accounting", name: "Accounting / bookkeeping", recurringRevenue: 5, marginPotential: 4, cashGeneration: 5, capitalIntensity: 1, ownerIndependence: 2, regulatoryIntensity: 4, staffAvailability: 3, growthPotential: 3, financingSuitability: 4, exitPotential: 4, competitiveFragmentation: 4, customerDiversification: 4, techOpportunity: 4, demandResilience: 5, lifestyleDemand: 2, weekendDependent: false, requiredSkills: ["financialAnalysis","regulatoryCompliance","customerService"], blurb: "Practice-based, fee-recurring, often requires professional qualification." },
  { id: "engineering", name: "Engineering services", recurringRevenue: 3, marginPotential: 3, cashGeneration: 3, capitalIntensity: 3, ownerIndependence: 2, regulatoryIntensity: 3, staffAvailability: 2, growthPotential: 3, financingSuitability: 3, exitPotential: 3, competitiveFragmentation: 3, customerDiversification: 3, techOpportunity: 3, demandResilience: 3, lifestyleDemand: 3, weekendDependent: false, requiredSkills: ["opsManagement","projectManagement","techImplementation"], blurb: "Technical design or contracting work, often skills-concentrated." },
  { id: "light-manufacturing", name: "Light manufacturing", recurringRevenue: 3, marginPotential: 3, cashGeneration: 3, capitalIntensity: 4, ownerIndependence: 3, regulatoryIntensity: 3, staffAvailability: 2, growthPotential: 3, financingSuitability: 3, exitPotential: 3, competitiveFragmentation: 3, customerDiversification: 3, techOpportunity: 3, demandResilience: 3, lifestyleDemand: 3, weekendDependent: false, requiredSkills: ["opsManagement","supplyChain","procurement","processImprovement"], blurb: "Production of goods at modest scale — machinery and premises intensive." },
  { id: "printing-signage", name: "Printing / signage", recurringRevenue: 2, marginPotential: 3, cashGeneration: 3, capitalIntensity: 3, ownerIndependence: 3, regulatoryIntensity: 1, staffAvailability: 3, growthPotential: 2, financingSuitability: 3, exitPotential: 2, competitiveFragmentation: 4, customerDiversification: 3, techOpportunity: 3, demandResilience: 2, lifestyleDemand: 2, weekendDependent: false, requiredSkills: ["opsManagement","sales","processImprovement"], blurb: "Project-based work; equipment-dependent, moderate margins." },
  { id: "waste-environmental", name: "Waste / environmental services", recurringRevenue: 5, marginPotential: 3, cashGeneration: 4, capitalIntensity: 3, ownerIndependence: 3, regulatoryIntensity: 4, staffAvailability: 3, growthPotential: 4, financingSuitability: 4, exitPotential: 3, competitiveFragmentation: 3, customerDiversification: 4, techOpportunity: 2, demandResilience: 5, lifestyleDemand: 2, weekendDependent: false, requiredSkills: ["regulatoryCompliance","logistics","contractManagement"], blurb: "Licensed collection or processing — contracted, non-discretionary demand." },
  { id: "landscaping", name: "Landscaping", recurringRevenue: 3, marginPotential: 2, cashGeneration: 3, capitalIntensity: 2, ownerIndependence: 2, regulatoryIntensity: 1, staffAvailability: 2, growthPotential: 2, financingSuitability: 2, exitPotential: 2, competitiveFragmentation: 5, customerDiversification: 3, techOpportunity: 1, demandResilience: 3, lifestyleDemand: 4, weekendDependent: true, requiredSkills: ["opsManagement","peopleLeadership","customerService"], blurb: "Grounds maintenance and gardening — seasonal, field-labour dependent." },
  { id: "automotive", name: "Automotive services", recurringRevenue: 2, marginPotential: 2, cashGeneration: 3, capitalIntensity: 3, ownerIndependence: 2, regulatoryIntensity: 2, staffAvailability: 2, growthPotential: 2, financingSuitability: 3, exitPotential: 2, competitiveFragmentation: 4, customerDiversification: 4, techOpportunity: 2, demandResilience: 3, lifestyleDemand: 3, weekendDependent: true, requiredSkills: ["opsManagement","customerService","procurement"], blurb: "Repair, servicing or parts — technically skilled labour dependent." },
  { id: "food-production", name: "Food production", recurringRevenue: 3, marginPotential: 2, cashGeneration: 3, capitalIntensity: 4, ownerIndependence: 3, regulatoryIntensity: 4, staffAvailability: 2, growthPotential: 3, financingSuitability: 3, exitPotential: 3, competitiveFragmentation: 3, customerDiversification: 3, techOpportunity: 2, demandResilience: 4, lifestyleDemand: 3, weekendDependent: false, requiredSkills: ["opsManagement","regulatoryCompliance","supplyChain"], blurb: "Manufacture of food products — hygiene regulation and capex heavy." },
  { id: "hospitality", name: "Hospitality", recurringRevenue: 1, marginPotential: 2, cashGeneration: 2, capitalIntensity: 4, ownerIndependence: 1, regulatoryIntensity: 3, staffAvailability: 1, growthPotential: 2, financingSuitability: 2, exitPotential: 2, competitiveFragmentation: 5, customerDiversification: 5, techOpportunity: 2, demandResilience: 2, lifestyleDemand: 5, weekendDependent: true, requiredSkills: ["opsManagement","customerService","peopleLeadership"], blurb: "Pubs, cafes and venues — thin margins, heavy owner-hours." },
  { id: "retail", name: "Retail", recurringRevenue: 1, marginPotential: 2, cashGeneration: 2, capitalIntensity: 3, ownerIndependence: 2, regulatoryIntensity: 2, staffAvailability: 2, growthPotential: 2, financingSuitability: 2, exitPotential: 2, competitiveFragmentation: 5, customerDiversification: 5, techOpportunity: 3, demandResilience: 2, lifestyleDemand: 4, weekendDependent: true, requiredSkills: ["sales","customerService","procurement","marketing"], blurb: "Bricks-and-mortar retail — footfall dependent, thin margins." },
  { id: "ecommerce", name: "E-commerce", recurringRevenue: 2, marginPotential: 3, cashGeneration: 3, capitalIntensity: 2, ownerIndependence: 3, regulatoryIntensity: 2, staffAvailability: 3, growthPotential: 4, financingSuitability: 3, exitPotential: 3, competitiveFragmentation: 4, customerDiversification: 4, techOpportunity: 4, demandResilience: 3, lifestyleDemand: 2, weekendDependent: false, requiredSkills: ["marketing","dataAnalysis","supplyChain","sales"], blurb: "Online retail brands — marketing and platform-dependent." },
  { id: "construction-trades", name: "Construction trades", recurringRevenue: 2, marginPotential: 2, cashGeneration: 2, capitalIntensity: 2, ownerIndependence: 2, regulatoryIntensity: 3, staffAvailability: 2, growthPotential: 3, financingSuitability: 2, exitPotential: 2, competitiveFragmentation: 5, customerDiversification: 3, techOpportunity: 2, demandResilience: 2, lifestyleDemand: 3, weekendDependent: false, requiredSkills: ["opsManagement","projectManagement","procurement"], blurb: "Project-based trade work — cyclical, working-capital sensitive." },
  { id: "security", name: "Security services", recurringRevenue: 5, marginPotential: 2, cashGeneration: 3, capitalIntensity: 1, ownerIndependence: 3, regulatoryIntensity: 3, staffAvailability: 2, growthPotential: 3, financingSuitability: 3, exitPotential: 3, competitiveFragmentation: 4, customerDiversification: 4, techOpportunity: 3, demandResilience: 4, lifestyleDemand: 4, weekendDependent: true, requiredSkills: ["opsManagement","recruitment","performanceManagement"], blurb: "Manned guarding or monitoring contracts — labour-heavy, contracted." },
]

export const CRITERIA_WEIGHTS = [
  { key: "personalInterest", label: "Personal interest", weight: 1, source: "you" },
  { key: "existingKnowledge", label: "Existing knowledge", weight: 2, source: "you" },
  { key: "transferableSkills", label: "Transferable skills", weight: 3, source: "you" },
  { key: "operationalUnderstanding", label: "Operational understanding", weight: 3, source: "you" },
  { key: "abilityToAddValue", label: "Ability to add value", weight: 3, source: "you" },
  { key: "demandResilience", label: "Demand resilience", weight: 3, source: "sector" },
  { key: "recurringRevenue", label: "Recurring revenue", weight: 3, source: "sector" },
  { key: "customerDiversification", label: "Customer diversification", weight: 2, source: "sector" },
  { key: "competitiveFragmentation", label: "Competitive fragmentation", weight: 2, source: "sector" },
  { key: "marginPotential", label: "Margin potential", weight: 3, source: "sector" },
  { key: "cashGeneration", label: "Cash generation", weight: 3, source: "sector" },
  { key: "capitalIntensity", label: "Capital intensity (inverted)", weight: 2, source: "sector" },
  { key: "ownerIndependence", label: "Owner independence", weight: 3, source: "sector" },
  { key: "staffAvailability", label: "Staff availability", weight: 2, source: "sector" },
  { key: "regulatoryManageability", label: "Regulatory manageability", weight: 2, source: "sector" },
  { key: "technologyOpportunity", label: "Technology opportunity", weight: 2, source: "sector" },
  { key: "growthPotential", label: "Growth potential", weight: 3, source: "sector" },
  { key: "financingSuitability", label: "Financing suitability", weight: 3, source: "sector" },
  { key: "exitPotential", label: "Exit potential", weight: 2, source: "sector" },
  { key: "lifestyleCompatibility", label: "Lifestyle compatibility", weight: 3, source: "you + sector" },
] as const

export const TOTAL_WEIGHT = CRITERIA_WEIGHTS.reduce((s, c) => s + c.weight, 0) // 50

export const MOTIVATION_ITEMS = [
  "I would rather acquire an established operation than build from zero.",
  "I want greater control over long-term income.",
  "I want to build an asset that could eventually be sold.",
  "I am comfortable taking responsibility for employees.",
  "I am prepared for ownership to be demanding for several years.",
  "I want to improve an existing business.",
  "I can make difficult decisions when necessary.",
  "I can tolerate some income uncertainty.",
  "I want to create wealth through ownership.",
  "My motivation is broader than escaping employment.",
] as const

export const TEMPERAMENT_ITEMS: Record<string, readonly string[]> = {
  "Decision making": ["Deciding under uncertainty", "Calculated risk-taking", "Prioritisation", "Reversing a poor decision", "Making an unpopular decision"],
  "Accountability": ["Personal responsibility", "Working independently", "Following through", "Self-management"],
  "Resilience": ["Performing under uncertainty", "Recovering from setbacks", "Handling rejection", "Managing simultaneous problems", "Asking for help"],
}

export const OWNERSHIP_STYLE_ITEMS: Record<string, readonly string[]> = {
  Operator: ["I enjoy day-to-day operations", "I enjoy direct customer interaction", "I enjoy hands-on, practical problem solving"],
  "Manager / Builder": ["I enjoy building and developing teams", "I enjoy designing systems and processes", "I enjoy organisational growth and scaling"],
  "Investor / Strategic owner": ["I enjoy financial analysis and capital allocation", "I enjoy strategy and governance more than daily operations", "I'm comfortable with management running operations while I set direction"],
}

export const RISK_ITEMS = [
  "Revenue volatility", "Employee turnover", "Customer concentration", "Supplier concentration",
  "Acquisition debt", "Personal guarantees", "Regulation", "Technology disruption", "Inventory",
  "Property leases", "Equipment failure", "Seasonality", "Recession exposure", "Litigation exposure",
  "Working-capital volatility",
] as const
