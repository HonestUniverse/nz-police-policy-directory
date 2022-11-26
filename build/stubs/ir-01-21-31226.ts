import { PolicyType } from '../../schema/Policy.js';
import { ProvenanceSource, ProvenanceMethod } from '../../schema/Provenance.js';
import { OIAWithholdingsSummary } from '../../schema/OIAWithholdings.js';

import type { StubPolicyWith, StubPolicyWithout } from '../create-stubs.js';
import { createStubs } from '../create-stubs.js';

// Police Manual chapter names sourced from https://fyi.org.nz/request/16707-police-manual-for-investing-offences-under-the-crimes-act#incoming-67034
const knownChapterNames = [
	'Abduction',
	'Acceleration measurement instruments',
	'Accident compensation',
	'Adult diversion deskfile - Part A Diversion overview, eligibility criteria and file evaluation',
	'Adult diversion deskfile - Part B Diversion court appearance, interview, agreement and completion',
	'Adult diversion scheme policy',
	'Adult sexual assault investigation policy and procedures',
	'Agencies investigating incidents',
	'Agricultural motor vehicles',
	'Alcohol - Closure of licensed premises',
	'Alcohol - Controlled purchase operations',
	'Alcohol - Enforcement of alcohol bans',
	'Alcohol - Fake or fraudulently-presented evidence of age documents',
	'Alcohol - Host responsibility and dealing with intoxicated persons',
	'Alcohol - Host responsibility-Police canteens and social functions',
	'Alcohol - Information sharing guidelines',
	'Alcohol - Intoxication Assessment Tool',
	'Alcohol - Licensed premises\' compliance checks',
	'Alcohol - Minors',
	'Alcohol - Misuse prevention, monitoring and enforcement strategies',
	'Alcohol - Police clubs and canteens',
	'Alcohol - Sale and Supply of Alcohol',
	'Alcohol - Substance Addiction (Compulsory Assessment and Treatment)',
	'Alcohol and drug impaired driving',
	'Animal identification and tracing',
	'Animals',
	'Appointments to specialist squads policy',
	'Armed Offenders Squad (AOS)',
	'Armoury',
	'Arms - Airguns',
	'Arms - Arms Introduction',
	'Arms - Arms Legislation Act 2020',
	'Arms - Compliance Revocations etc',
	'Arms - Dealers Gunsmiths & Auctioneers',
	'Arms - Endorsements and conditions',
	'Arms - Firearms Licences',
	'Arms - Health Practitioner Reporting',
	'Arrest and detention',
	'Arson (fire and explosion investigations)',
	'Assaults and injuries to the person',
	'Association offences',
	'Attempts',
	'Authorised Officers',
	'Automatic Number Plate Recognition',
	'Bail',
	'Banking, currency and card policy',
	'Blackmail',
	'Blood and body fluid exposure',
	'Body Armour System (BAS) policy',
	'Boxing and wrestling contests',
	'Burglary and allied offences',
	'Business Continuity Management Policy',
	'Cabinet and Cabinet Committee papers',
	'Calibrating road policing equipment',
	'Case management',
	'Cash handling',
	'Ceremonial - Pt01 Orders Decorations and Medals',
	'Ceremonial - Pt02 Saluting and Respect',
	'Ceremonial - Pt03 Flag flying',
	'Ceremonial - Pt04 Parades',
	'Ceremonial - Pt05 Police Remembrance Day',
	'Ceremonial - Pt06 Formal Police Dining',
	'Ceremonial - Pt07 Death of a Police employee',
	'Ceremonial - Pt08 Styles of address',
	'Ceremonial - Pt09 Police pipe bands',
	'Charging decisions',
	'Chief Justice practice note on Police questioning',
	'Child protection - Investigating online offences against children',
	'Child protection - Mass allegation investigation',
	'Child protection - Specialist accreditation, case management and assurance',
	'Child protection investigation policy and procedures',
	'Child Protection Policy (overarching policy)',
	'Child Sex Offender Register',
	'Civil defence and emergency management',
	'Clandestine drug laboratories',
	'Clinical supervision of Youth Development employees',
	'Code of Conduct',
	'Command - Glossary',
	'Command - Part 1 Command and control overview',
	'Command - Part 2 Planning, control and command',
	'Command - Part 3 Operation Headquarters',
	'Command - Part 4 Inter-district Operations',
	'Command - Part 5 Multi-agency response to incidents',
	'Command - Part 6 Logistics',
	'Command - Part 7 Perimeter control',
	'Community Impact Assessments (CIAs)',
	'Community policing engagement',
	'Constabulary recruitment',
	'Contractor and Third Party Organisations Health and Safety Management',
	'Control of high-power laser devices',
	'Coordinated Incident Management System',
	'Counter Terrorism',
	'Covert backstopping',
	'Crash scene photography',
	'Crime prevention cameras CCTV in public',
	'Criminal disclosure',
	'Criminal procedure - Administration stage',
	'Criminal procedure - Commencement of proceedings',
	'Criminal procedure - Costs orders',
	'Criminal procedure - Disposition',
	'Criminal procedure - Introduction and jurisdiction',
	'Criminal procedure - Review stage (CMM process)',
	'Criminal procedure - Trial stage',
	'Dangerous goods inspections',
	'Dealers Traders-Auctioneers',
	'Dealers Traders-Motor vehicle traders',
	'Dealers Traders-Repossession agents & employees',
	'Dealers Traders-Second hand dealers and pawnbrokers legislation',
	'Dealers Traders-Second hand dealers and pawnbrokers vetting and inquiries',
	'Debriefs',
	'Deception',
	'Departing from Police',
	'Departmental Security - Employee telephone requests for information',
	'Departmental Security - Managing security risks in policing',
	'Departmental Security - Operation security',
	'Departmental Security - Personnel security',
	'Departmental Security - Physical security',
	'Departmental Security - Security alert status system',
	'Deploying Iwi Liaison Officers (ILO)',
	'Deportation escorts',
	'Diplomatic and consular privileges and immunities',
	'Disaster Victim Identification',
	'Disciplinary Policy',
	'Disciplinary Process',
	'Driver licensing',
	'Drugs - Part 01 Drug related definitions',
	'Drugs - Part 02 Offences under the Misuse of Drugs Act 1975',
	'Drugs - Part 03 Offences under the Health (Needles and Syringes) Regulations 1998 and the Medicines Act 1981',
	'Drugs - Part 04 General searches in respect of drugs',
	'Drugs - Part 05 Internal searches in respect of drugs',
	'Drugs - Part 06 Warrants and warrantless powers authorising use of surveillance devices',
	'Drugs - Part 07 Controlled deliveries',
	'Drugs - Part 08 Drug prosecutions',
	'Drugs - Part 09 Drug information and identification',
	'Drugs - Part 10 Drug investigations',
	'Drugs - Part 11 Custody, storage and disposal of controlled drugs',
	'Drugs - Part 12 Police personnel working as Drug Investigators',
	'Drugs - Part 13 Psychoactive substances',
	'Drugs - Part 14 Medicinal cannabis',
	'Drugs - Part 15 Police discretion with possession/use of controlled drugs and/or possession of utensils offences',
	'Drugs - Part 16 Drug and substance checking',
	'Early intervention',
	'Elections and political matters-a guide for police employees',
	'Electronic Interception - Covert entry and search',
	'Electronic Interception - Covert imagery',
	'Electronic Interception - Crime Monitoring Centre',
	'Electronic Interception - Interception phases',
	'Electronic Interception - Introduction to electronic interception',
	'Electronic Interception - Tracking devices',
	'Employee Assistance Programme',
	'Employee health monitoring',
	'Employment Agreements - Bougainville Community Policing Project Deployments',
	'Employment Agreements - Competency service increment (CSI) policy',
	'Employment Agreements - Constabulary Collective Employment Agreement 2018-2021',
	'Employment Agreements - Constabulary Individual Employment Agreement (Bands A-J)',
	'Employment Agreements - Employee Individual Employment Agreement (Bands A-J)',
	'Employment Agreements - Employee Collective Employment Agreement 2018-2021',
	'Employment Agreements - Employee Fixed Term Individual Employment Agreement (Bands A-J) - Less than six months',
	'Employment Agreements - Employee Fixed Term Individual Employment Agreement (Bands A-J) - Six months or more',
	'Employment Agreements - Police Managers Collective Agreement Grades 21-24 (2019 - 2022)',
	'Employment Agreements - Police Managers Individual Employment Agreement',
	'Employment Agreements - Recruit fixed term individual employment agreement',
	'Employment movements',
	'Employment relationship problems',
	'Establishing Maori Advisory Boards',
	'Executive Remuneration Policy',
	'Exhibits and property - Custody and disposal of exhibits',
	'Exhibits and property - Disposal of found property',
	'Exhibits and property - Disposal of non-Police firearms',
	'Exhibits and property - Introduction to Exhibit and property management',
	'Exhibits and property - Packaging, handling, and storage of exhibits',
	'Exhibits and property - Receiving property and exhibits',
	'Exhibits and property - Reporting and internal control checks',
	'Exhumations and offences involving exhumation, burial and cremation',
	'Exotic disease or pest incursions',
	'Expert evidence - drugs and gangs',
	'Extraditions',
	'Family harm - Information sharing guidelines',
	'Family harm - Parental control (s59 Crimes Act)',
	'Family harm - Police family violence death reviews',
	'Family harm - Police safety orders',
	'Family harm - Protection and related property orders',
	'Family harm - Victim relocations',
	'Family harm policy and procedures',
	'Family Harm Quality Assurance and Improvement Framework',
	'Family Violence Information Disclosure Scheme',
	'Fare evasion',
	'Financial assistance on transfers',
	'Financial delegations',
	'Finding space debris or equipment',
	'Fingerprints and SOCO laboratory and crime scene safety',
	'Fingerprints-biometric',
	'Fireworks',
	'First aid training and equipment',
	'Fisheries protection',
	'Fixed assets',
	'Fleeing driver policy',
	'Flexible Employment Policy',
	'Forced and under-age marriages',
	'Forensic - Accelerants or volatile substances',
	'Forensic - Anthropology (forensic anthropology)',
	'Forensic - Bite marks and dental evidence',
	'Forensic - Blood pattern analysis and interpretation',
	'Forensic - Compusketch facial identification system',
	'Forensic - Crime scene examination',
	'Forensic - DNA evidence at crime scenes',
	'Forensic - DNA Sampling',
	'Forensic - Document examination',
	'Forensic - Drugs at crime scenes',
	'Forensic - Dye traps',
	'Forensic - Fibres and hair',
	'Forensic - Firearm discharge residues',
	'Forensic - Firearms evidence',
	'Forensic - Footwear evidence',
	'Forensic - Forensic contacts and services',
	'Forensic - Glass',
	'Forensic - Insects (entomology)',
	'Forensic - Kits for collecting evidence samples',
	'Forensic - Knots',
	'Forensic - Microanalysis',
	'Forensic - Paint',
	'Forensic - Physical or mechanical fits',
	'Forensic - Pollen',
	'Forensic - Preservation and recovery of electronic evidence',
	'Forensic - Serial number restoration',
	'Forensic - Tool marks',
	'Forensic - Toxicology',
	'Forensic mapping',
	'Formal warnings',
	'Found and recovered jewellery',
	'Fraud and corruption',
	'Fringe benefit taxation',
	'Full time study assistance',
	'Gambling and lotteries',
	'Gang Insignia in government premises',
	'Gifts, discounts and hospitality',
	'Goods and services tax',
	'Government indemnity for important exhibitions',
	'Harassment Act caution letters',
	'Hazard and risk management',
	'Hazardous substances management',
	'Head injuries',
	'Health and safety worker engagement, participation and representation',
	'Health clearance at the border',
	'Health standards for constables',
	'High Visibility Safety Garments',
	'Historical and cultural heritage of New Zealand',
	'Home workers health and safety guidelines',
	'Homicide - Part 01 Initial response',
	'Homicide - Part 02 Role of the OC Investigations',
	'Homicide - Part 03 Crime scene management',
	'Homicide - Part 04 Search (for bodies of victims)',
	'Homicide - Part 05 Victims',
	'Homicide - Part 06 Family liaison',
	'Homicide - Part 07 Media strategy',
	'Homicide - Part 08 General enquiries',
	'Homicide - Part 09 Area canvass enquiries',
	'Homicide - Part 10 Witness management',
	'Homicide - Part 11 Passive data generators',
	'Homicide - Part 12 Role of the OC Suspects (persons of interest)',
	'Homicide - Part 13 Role of the Second-In-Charge (2IC)',
	'Homicide - Part 14 File management',
	'Homicide - Part 15 Criminal disclosure',
	'Homicide - Part 16 Exhibit management',
	'Homicide - Part 17 Intelligence',
	'Homicide - Part 18 Oversight, reviews and debriefs',
	'Homicide - Part 19 Legal considerations',
	'Honours awards and commendations',
	'Housing for employees',
	'Human Sources - Part 01 Introduction to Police Human Sources',
	'Human Sources - Part 02 Police Human Sources recruitment and registration',
	'Human Sources - Part 03 Police Human Sources management',
	'Human Sources - Part 04 Police Human Sources - CHIS tasking',
	'Human Sources - Part 05 Police Human Sources - CHIS rewards',
	'Human Sources - Part 06 Police Human Sources - Administration and security',
	'Human Sources - Part 07 Police Human Sources related roles and responsibilities',
	'Human Sources - Part 08 Police Human Sources information in warrants, orders and disclosure',
	'Human Sources - Part 09 Police Human Sources Compromise National Response Model',
	'Identification of offenders',
	'Identifying drivers with face coverings',
	'Identifying particulars for summons',
	'Identity information sharing',
	'Illness related absences',
	'Impounding vehicles',
	'Improvised explosive devices and bomb incidents',
	'Information and records management procedures PNHQ and RNZPC',
	'Information security - Acceptable use of information and ICT',
	'Information security - Electronic redaction and disclosure',
	'Information security - Email and Text messages',
	'Information security - ICT projects and service delivery',
	'Information security - Information classification and protection',
	'Information security - Information security',
	'Information security - Information security roles and responsibilities',
	'Information security - People Managers',
	'Information security - Third party access to the Secure Digital Radio Network (SDRN)',
	'Information security - Working with information classified CONFIDENTIAL and above',
	'Insurances',
	'Integrity reporting and Speaking Up',
	'Intel - Collection management',
	'Intel - Crimestoppers',
	'Intel - Decision-making and planning',
	'Intel - Evaluating effectiveness of intel',
	'Intel - Intelligence categories',
	'Intel - Intelligence for investigations',
	'Intel - Intelligence products',
	'Intel - Introduction to Intelligence',
	'Intel - Issue motivated and protest groups\' intelligence',
	'Intel - Professional Development in Intelligence Programme',
	'Intel - Selection of operation names',
	'Intel - The Intelligence cycle',
	'Internal control',
	'Interpol',
	'Interpreting for the deaf',
	'Interpreting Services - Ezispeak (previously Language Line)',
	'Investigation of critical incidents',
	'Investigative interviewing - Specialist child witness interview guidelines',
	'Investigative interviewing - suspects requiring special consideration',
	'Investigative interviewing - witnesses requiring special consideration',
	'Investigative interviewing accreditation policy',
	'Investigative interviewing suspect guide',
	'Investigative interviewing witness guide',
	'Inviting the Commissioner or a member of the Executive to an event',
	'Inviting the Prime Minister, Ministers of the Crown, or Governor General to an event',
	'Kidnapping for ransom',
	'Leave management policy',
	'Leave without pay',
	'Leaving police on health grounds',
	'Load security',
	'Management of observers',
	'Managing a Police process',
	'Managing conflicts of interest',
	'Managing Corrections prisoners',
	'Managing fatigue related risk',
	'Managing Youth development client information',
	'Market rate policy',
	'Match-fixing',
	'Media - Dealing with the media',
	'Media - Media access to Police property or characters',
	'Media - Media filming of Police operations',
	'Media - Media interviews',
	'Media - News releases',
	'Media - Online channels - web, intranet, social media and video',
	'Media - Releasing information to the media',
	'Media - Releasing information to the media after a sudden death',
	'Media - Social media policy',
	'Media - Sponsorship',
	'Media - Sub judice',
	'Media - The electronic bulletin board',
	'Media - TikTok',
	'Media - Visual identity',
	'Missing persons',
	'Mobile phone enforcement and use in Police vehicles',
	'Motor vehicle noise enforcement',
	'Motor vehicle registration and licensing',
	'National recording standard',
	'Neighbourhood Policing Teams',
	'New Zealand Bill of Rights',
	'New Zealand Police Library (Kai)',
	'New Zealand Police Museum collection management policy',
	'Night vision equipment',
	'No surprises policy',
	'Nomex hoods',
	'Non-Police firearms security management',
	'Non-violence programmes and prescribed services',
	'Non-work related injuries',
	'Notebooks and Job sheets',
	'Objectionable publications',
	'OCEANZ operations',
	'Off-duty interventions',
	'Offence notices',
	'Offensive weapons, knives and disabling substances',
	'Officer Safety Alarms',
	'Output costing policy',
	'Overseas assignment policy',
	'Parental Leave Policy and Parental Guidelines',
	'Parole and other community based sentences and orders',
	'Part time study assistance',
	'Partnership between community groups and police',
	'PAYE and withholding tax',
	'People in Police custody',
	'People trafficking and migrant smuggling',
	'People Unlawfully in New Zealand',
	'People with mental impairments',
	'Performance management',
	'Perjury',
	'Personation of Police and related offences',
	'Photography (Forensic imaging)',
	'Point duty',
	'Police air operations',
	'Police chaplaincy services',
	'Police cultural groups',
	'Police Deployability',
	'Police Dogs - Pt 01 General information for Police employees about Police dogs',
	'Police Dogs - Pt 02 New Zealand Police Dog Section',
	'Police Dogs - Pt 03 Dog Section staff management',
	'Police Dogs - Pt 04 Dog management',
	'Police Dogs - Pt 05 Dog Team Training',
	'Police Dogs - Pt 06 Certification of Police dogs',
	'Police Dogs - Pt 07 Dog displays',
	'Police Dogs - Pt 08 Use of force and Police dogs',
	'Police Dogs - Pt 09 Dog deployment exercises with Defence and other agencies',
	'Police drug and alcohol policy',
	'Police exercises',
	'Police filming and audio recording of operations and events',
	'Police governance and leadership',
	'Police identity cards',
	'Police information and records management policy',
	'Police Instructions Policy',
	'Police Integrated Tactical Training (PITT)',
	'Police Interagency Agreements Policy',
	'Police investigations of complaints and notifiable incidents',
	'Police Medical Officers',
	'Police National Dive Squad (PNDS)',
	'Police negotiators',
	'Police property management',
	'Police Prosecution Service - Statement of policy and practice',
	'Police response to bullying of children and young people',
	'Police response to cyberbullying and the Harmful Digital Communications Act',
	'Police vehicle management',
	'Police Vetting Service',
	'Police volunteers',
	'Policing in the maritime environment',
	'Policing Outlaw Motorcycle Gang Runs',
	'Policy and guidelines for storage of physical files',
	'Policy permitting destruction of certain paper-based offence reports',
	'Policy, practice and procedure reviews',
	'Posting rewards for investigations',
	'Preparing ministerial briefing papers',
	'Prisoner Escort and Transport Manual',
	'Privacy and official information - Disclosure under the Privacy Act 2020',
	'Privacy and official information - Introduction to disclosure of information',
	'Privacy and official information - Applying the Criminal Records (Clean Slate) Act 2004',
	'Privacy and official information - Collecting personal information',
	'Privacy and official information - Community disclosure of offender information',
	'Privacy and official information - Disclosure under the Official Information Act 1982 (OIA)',
	'Privacy and official information - Information Privacy Principles (IPPs)',
	'Privacy and official information - Privacy breach management',
	'Privacy and official information - Privacy Impact Assessments - Privacy by design',
	'Private Investigators and Security Consultants requests to Police for assistance',
	'Private Security Personnel and Private Investigators',
	'Probationary Constables Policy',
	'Procurement - Pt 1 Introduction to Police procurement',
	'Procurement - Pt 2 Existing contracts',
	'Procurement - Pt 3 Sourcing',
	'Procurement - Pt 4 Legislative and environmental considerations',
	'Procurement - Pt 5 More about us',
	'Professional Police Driver Programme (PPDP)',
	'Property damage, endangering, contamination and waste',
	'Proposals to test or trial use of emergent technologies',
	'Prosecuting family violence',
	'Prosecution file and trial preparation',
	'Protected disclosures',
	'Protected voluntary military service or training',
	'Psychometric assessments',
	'Public Order Policing - Pt01 Introduction to Public Order Management',
	'Public Order Policing - Pt02 Police Support Units',
	'Public Order Policing - Pt03 Public Order Intervention Model',
	'Public Order Policing - Pt04 Noise Control',
	'Public Order Policing - Pt05 Out of Control Gatherings',
	'Public Order Policing - Pt06 Behaviour Offences',
	'Public Order Policing - Pt07 Unlawful Assembly and-or Rioting',
	'Public Order Policing - Pt08 Demonstrations',
	'Public Order Policing - Pt09 Policing Parliamentary Precincts',
	'Public Order Policing - Pt10 Mass Arrest Planning',
	'Public Order Policing - Pt11 Public Order Protection Equipment',
	'Radio and Emergency Communications Centre Protocols',
	'Ranks (position levels) for constabulary employees (policy and guidelines)',
	'Receiving',
	'Recording and reviewing health and safety events',
	'Recruitment policy',
	'Rehabilitation policy and procedures',
	'Reimbursing dependant care expenses',
	'Rejoining Police',
	'Remotely Piloted Aircraft Systems (RPAS)',
	'Remuneration policy',
	'Restructuring',
	'Retention and disposal of Police records',
	'Returning Offenders Management and Information Regime',
	'Review of appointments',
	'Rights caution',
	'Risk Management Policy',
	'Road user charges',
	'Roadside incidents',
	'Robbery',
	'Salary overpayment recovery policy',
	'School Community Policing',
	'Search and Rescue operations',
	'Search Part 01 - Search introduction',
	'Search Part 02 - Search warrants',
	'Search Part 03 - Warrantless powers to search places, vehicles and things',
	'Search Part 04 - Consent searches',
	'Search Part 05 - Carrying out search powers with or without warrants',
	'Search Part 06 - Roadblocks and stopping vehicles for search purposes',
	'Search Part 07 - Methods for searching places and vehicles',
	'Search Part 08 - Searching people',
	'Search Part 09 - Production orders',
	'Search Part 10 - Examination orders',
	'Search Part 11 - Declaratory orders',
	'Search Part 12 - Procedures applying to seized and produced things',
	'Search Part 13 - Privilege and immunities under the Act',
	'Search Part 14 - Reporting',
	'Search Part 15 - Government agency requests for assistance with search warrants',
	'Search Part 16 - Property damage incurred during searches or exercise of statutory powers',
	'Secondary employment',
	'Security of private premises',
	'Sensitive expenditure policy',
	'Serious crash investigation review',
	'Service Delivery Guidelines for Policing Interactions',
	'Sexual offences',
	'Sick leave',
	'Situational Awareness Map (SAM) and Deployment and Safety app (DaS)',
	'Smoke-free workplace policy',
	'Social Networking, Open Source Information and Online Practitioner',
	'Solicitor General\'s Prosecution Guidelines',
	'Special Tactics Group (STG)',
	'Specialist Search Group',
	'Specialist work group health, safety and wellness self-assessments',
	'Speed enforcement',
	'Sports within Police',
	'Stab Resistant Body Armour (SRBA) policy',
	'Statutory declarations',
	'STG Required physical fitness policy',
	'Sudden death',
	'Surveillance - Categories of surveillance with a device',
	'Surveillance - Introduction',
	'Surveillance - Privilege and immunities involving surveillance',
	'Surveillance - Retention & destruction of surveillance data & documents',
	'Surveillance - Surveillance by radar and from aircraft, drones etc',
	'Surveillance - Surveillance device warrants',
	'Surveillance - Surveillance reporting',
	'Surveillance - Surveillance squad',
	'Tasking and coordination',
	'Te Pae Oranga',
	'Technical Support Unit',
	'Telecommunication investigations',
	'TENR Operational threat assessment',
	'Theft',
	'Threats against the Police and the judiciary',
	'Three stage warning regime (\'3 strikes\')',
	'TOIL management',
	'Towing and storing privately owned motor vehicles',
	'Traffic compliance scheme',
	'Traffic control at special events',
	'Traffic crashes',
	'Traffic patrol techniques',
	'Transnational technology enabled crime - Advice for investigators',
	'Transport Service Licence',
	'Trauma support policy',
	'Travel policy',
	'Trespass',
	'Tyre deflation devices',
	'Unacceptable behaviour - Kia Tū policy and guidelines',
	'Undercover policing',
	'Uniform, dress standards and appearance',
	'Unpublished names on the electoral roll',
	'Urgent after hours contact with PNHQ',
	'Urgent Duty Driving',
	'Use of Force - Approved tactical equipment and carriage for constables and Authorised',
	'Officers (non-specialist)',
	'Use of Force - Batons',
	'Use of Force - CS Gas',
	'Use of Force - eXact Impact QX1006 (Less lethal option)',
	'Use of Force - Mechanical restraints',
	'Use of Force - Oleoresin Capsicum spray',
	'Use of Force - Police firearms',
	'Use of Force - Positional asphyxia',
	'Use of Force - TASER (Conducted Electrical Weapons)',
	'Use of Force - Use of Force Overview',
	'Vehicle crash data recording devices',
	'Vehicle crime',
	'Vehicle dimensions and mass',
	'Vehicle inspections',
	'Victims (Police service to victims)',
	'Victims\' orders against violent offenders (Non-contact orders)',
	'VIP security planning and operations',
	'Wellcheck support policy',
	'Wellness Policy',
	'Wheel clamping',
	'Witness protection',
	'Work related injuries',
	'Working at height',
	'Working with community patrols',
	'Written Traffic Warnings',
	'Youth justice - Part 1 Introduction to youth justice',
	'Youth justice - Part 2 Responding to youth offending and related issues',
	'Youth justice - Part 3 Criminal procedure in the Youth Court',
];

type StubProps = 'name';

const stubs: StubPolicyWith<StubProps>[] = knownChapterNames.map((name) => ({ name }));
const base: StubPolicyWithout<StubProps> = {
	schemaVersion: '0.5.1',
	type: PolicyType.POLICE_MANUAL_CHAPTER,
	provenance: [{
		source: ProvenanceSource.NZ_POLICE,
		method: ProvenanceMethod.RELEASED_UNDER_THE_OIA,
		oiaRequest: {
			requester: 'Amy S Van Wey Lovatt',
			id: 'IR-01-21-31226',
			responseUrl: 'https://fyi.org.nz/request/16707-police-manual-for-investing-offences-under-the-crimes-act#incoming-67034',
			withholdings: OIAWithholdingsSummary.NONE,
		},
		released: '2021-11-23',
		retrieved: '2022-06-06',
		url: 'https://fyi.org.nz/request/16707-police-manual-for-investing-offences-under-the-crimes-act#incoming-67034',
		fileUrl: 'https://fyi.org.nz/request/16707/response/67034/attach/3/Van%20Wey%20Lovatt%20Amy%20IR%2001%2021%2031226%20final%20response.pdf',
	}],
	versions: [],
};

createStubs(stubs, base);
