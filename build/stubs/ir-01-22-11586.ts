import { PolicyType } from '../../schema/Policy.js';

import type { Provenance } from '../../schema/Provenance.js';
import { ProvenanceSource, ProvenanceMethod } from '../../schema/Provenance.js';

import { OIAWithholdingsSummary } from '../../schema/OIAWithholdings.js';

import type { StubPolicyWith, StubPolicyWithout } from '../create-stubs.js';
import { createStubs } from '../create-stubs.js';

import { generateId } from '../generate-ids.js';

type StubProps = 'name' | 'versions';

const stubsSource: [string, string][] = [
	['Abduction', '15/9/2021'],
	['Acceleration measurement instruments', '7/10/2019'],
	['Accident compensation', '3/9/2018'],
	['Account takeover policy', '21/2/2022'],
	['Adult diversion deskfile - Part A Diversion overview, eligibility criteria and file evaluation ', '18/12/2019'],
	['Adult diversion deskfile - Part B Diversion court appearance, interview, agreement and completion', '18/12/2019'],
	['Adult diversion scheme policy', '18/12/2019'],
	['Adult sexual assault investigation policy and procedures', '7/12/2016'],
	['Agencies investigating incidents', '28/9/2018'],
	['Agricultural motor vehicles', '6/9/2019'],
	['Alcohol - Closure of licensed premises', '8/11/2016'],
	['Alcohol - Controlled purchase operations', '22/6/2018'],
	['Alcohol - Enforcement of alcohol bans', '9/1/2019'],
	['Alcohol - Fake or fraudulently-presented evidence of age documents', '19/9/2017'],
	['Alcohol - Host responsibility and dealing with intoxicated persons', '15/2/2016'],
	['Alcohol - Host responsibility-Police canteens and social functions', '7/11/2016'],
	['Alcohol - Information sharing guidelines', '7/11/2016'],
	['Alcohol - Intoxication Assessment Tool', '7/11/2016'],
	['Alcohol - Licensed premises\' compliance checks', '7/11/2016'],
	['Alcohol - Minors', '18/9/2017'],
	['Alcohol - Misuse prevention, monitoring and enforcement strategies', '7/11/2016'],
	['Alcohol - Police clubs and canteens', '17/12/2013'],
	['Alcohol - Sale and Supply of Alcohol', '8/11/2016'],
	['Alcohol - Substance Addiction (Compulsory Assessment and Treatment)', '22/2/2018'],
	['Alcohol and drug impaired driving', '9/7/2019'],
	['Animal identification and tracing', '27/9/2017'],
	['Animals', '8/10/2019'],
	['Appointments to specialist squads policy', '15/9/2020'],
	['Armed Offenders Squad (AOS)', '18/7/2017'],
	['Armoury', '1/3/2022'],
	['Arms - Airguns', '13/11/2020'],
	['Arms - Arms Introduction', '13/11/2020'],
	['Arms - Arms Legislation Act 2020', '13/11/2020'],
	['Arms - Compliance Revocations etc', '14/1/2021'],
	['Arms - Dealers Gunsmiths & Auctioneers', '13/11/2020'],
	['Arms - Endorsements and conditions', '26/5/2021'],
	['Arms - Firearms Licences', '13/11/2020'],
	['Arms - Health Practitioner Reporting', '16/12/2020'],
	['Arrest and detention', '1/7/2016'],
	['Arson (fire and explosion investigations)', '16/9/2014'],
	['Assaults and injuries to the person', '8/11/2017'],
	['Association offences', '13/4/2018'],
	['Attempts', '13/6/2017'],
	['Authorised Officers  ', '11/8/2015'],
	['Automatic Number Plate Recognition', '27/4/2016'],
	['AWHI voluntary referrals', '24/3/2022'],
	['Bail', '10/7/2019'],
	['Banking, currency and card policy', '2/9/2021'],
	['Blackmail', '17/5/2021'],
	['Blood and body fluid exposure ', '6/6/2019'],
	['Body Armour System (BAS) policy', '10/3/2021'],
	['Boxing and wrestling contests', '8/4/2022'],
	['Burglary and allied offences', '2/7/2021'],
	['Business Continuity Management Policy', '16/2/2022'],
	['Cabinet and Cabinet Committee papers', '15/7/2019'],
	['Calibrating road policing equipment', '11/7/2018'],
	['Case management', '30/1/2018'],
	['Cash handling', '6/10/2020'],
	['Ceremonial - Pt01 Orders Decorations and Medals', '15/11/2017'],
	['Ceremonial - Pt02 Saluting and Respect', '15/11/2017'],
	['Ceremonial - Pt03 Flag flying', '15/11/2017'],
	['Ceremonial - Pt04 Parades', '15/11/2017'],
	['Ceremonial - Pt05 Police Remembrance Day', '15/11/2017'],
	['Ceremonial - Pt06 Formal Police Dining', '15/11/2017'],
	['Ceremonial - Pt07 Death of a Police employee', '15/11/2017'],
	['Ceremonial - Pt08 Styles of address', '15/11/2017'],
	['Ceremonial - Pt09 Police pipe bands', '9/3/2018'],
	['Charging decisions', '15/8/2018'],
	['Charging for Official Information requests', '31/1/2022'],
	['Chief Justice practice note on Police questioning', '18/9/2014'],
	['Child protection - Investigating online offences against children ', '28/8/2017'],
	['Child protection - Mass allegation investigation ', '28/8/2017'],
	['Child protection - Specialist accreditation, case management and assurance', '1/3/2018'],
	['Child protection investigation policy and procedures ', '8/2/2017'],
	['Child Protection Policy (overarching policy) ', '20/3/2017'],
	['Child Sex Offender Register ', '13/10/2016'],
	['Civil defence and emergency management', '1/5/2017'],
	['Clandestine drug laboratories', '12/4/2021'],
	['Clinical supervision of Youth Development employees', '15/10/2013'],
	['Code of Conduct', '11/2/2022'],
	['Command - Glossary', '1/5/2017'],
	['Command - Part 1 Command and control overview', '1/5/2017'],
	['Command - Part 2 Planning, control and command', '1/5/2017'],
	['Command - Part 3 Operation Headquarters', '1/5/2017'],
	['Command - Part 4 Inter-district Operations', '1/5/2017'],
	['Command - Part 5 Multi-agency response to incidents', '1/5/2017'],
	['Command - Part 6 Logistics', '1/5/2017'],
	['Command - Part 7 Perimeter control', '1/5/2017'],
	['Community Impact Assessments (CIAs)', '22/11/2018'],
	['Community policing engagement', '26/11/2014'],
	['Constabulary recruitment ', '22/1/2019'],
	['Contractor and Third Party Organisations Health and Safety Management', '9/9/2019'],
	['Control of high-power laser devices', '27/9/2016'],
	['Coordinated Incident Management System', '2/9/2019'],
	['Counter Terrorism', '7/5/2018'],
	['Covert backstopping', '1/2/2019'],
	['Crash scene photography', '19/4/2017'],
	['Crime prevention cameras CCTV in public', '7/6/2017'],
	['Criminal disclosure', '19/7/2016'],
	['Criminal procedure - Administration stage ', '16/8/2018'],
	['Criminal procedure - Commencement of proceedings ', '16/8/2018'],
	['Criminal procedure - Costs orders', '16/8/2018'],
	['Criminal procedure - Disposition', '16/8/2018'],
	['Criminal procedure - Introduction and jurisdiction', '16/8/2018'],
	['Criminal procedure - Review stage (CMM process)', '16/8/2018'],
	['Criminal procedure - Trial stage', '16/8/2018'],
	['Dangerous goods inspections', '20/3/2019'],
	['DealersTraders-Auctioneers', '7/2/2018'],
	['DealersTraders-Motor vehicle traders', '7/2/2018'],
	['DealersTraders-Repossession agents & employees', '7/2/2018'],
	['DealersTraders-Secondhand dealers and pawnbrokers legislation', '7/2/2018'],
	['DealersTraders-Secondhand dealers and pawnbrokers vetting and inquiries', '15/12/2021'],
	['Debriefs', '29/3/2018'],
	['Deception', '8/5/2018'],
	['Departing from Police ', '28/6/2018'],
	['Departmental Security - Employee telephone requests for information', '15/3/2021'],
	['Departmental Security - Managing security risks in policing', '7/4/2021'],
	['Departmental Security - Operation security', '6/4/2021'],
	['Departmental Security - Personnel security', '7/4/2021'],
	['Departmental Security - Physical security', '6/4/2021'],
	['Departmental Security - Security alert status system', '20/9/2021'],
	['Deploying Iwi Liaison Officers (ILO)', '4/9/2013'],
	['Deportation escorts', '22/5/2013'],
	['Diplomatic and consular privileges and immunities', '18/7/2017'],
	['Disaster Victim Identification', '1/12/2016'],
	['Disciplinary Policy (and associated \'Disciplinary Process guidelines)', '11/7/2016'],
	['Driver licensing', '7/7/2017'],
	['Drugs - Part 01 Drug related definitions', '3/8/2020'],
	['Drugs - Part 02 Offences under the Misuse of Drugs Act 1975', '3/8/2020'],
	['Drugs - Part 03 Offences under the Health (Needles and Syringes) Regulations 1998 and the Medicines Act 1981', '3/8/2020'],
	['Drugs - Part 04 General searches in respect of drugs', '17/5/2021'],
	['Drugs - Part 05 Internal searches in respect of drugs', '9/6/2021'],
	['Drugs - Part 06 Warrants and warrantless powers authorising use of surveillance devices', '4/8/2020'],
	['Drugs - Part 07 Controlled deliveries', '4/8/2020'],
	['Drugs - Part 08 Drug prosecutions', '4/8/2020'],
	['Drugs - Part 09 Drug information and identification', '4/8/2020'],
	['Drugs - Part 10 Drug investigations', '4/8/2020'],
	['Drugs - Part 11 Custody, storage and disposal of controlled drugs', '4/8/2020'],
	['Drugs - Part 12 Police personnel working as Drug Investigators', '4/8/2020'],
	['Drugs - Part 13 Psychoactive substances', '4/8/2020'],
	['Drugs - Part 14 Medicinal cannabis', '29/9/2021'],
	['Drugs - Part 15 Police discretion with possession/use of controlled drugs and/or possession of utensils offences', '27/1/2021'],
	['Drugs - Part 16 Drug and substance checking', '16/12/2020'],
	['Early intervention ', '7/1/2019'],
	['Elections and political matters-a guide for police employees', '17/9/2018'],
	['Electronic Interception - Covert entry and search', '15/7/2021'],
	['Electronic Interception - Covert imagery', '15/7/2021'],
	['Electronic Interception - Crime Monitoring Centre', '27/7/2021'],
	['Electronic Interception - Interception phases', '28/7/2021'],
	['Electronic Interception - Introduction to electronic interception', '29/6/2021'],
	['Electronic Interception - Tracking devices', '15/7/2021'],
	['Employee Assistance Programme', '9/11/2017'],
	['Employee health monitoring', '23/7/2019'],
	['Employment Agreements - Competency service increment (CSI) policy', '26/5/2008'],
	['Employment Agreements - Constabulary Collective Employment Agreement 2018-2021', '18/2/2019'],
	['Employment Agreements - Constabulary Individual Employment Agreement (Bands A-J)', '19/2/2019'],
	['Employment Agreements - Employee  Individual Employment Agreement (Bands A-J)', '19/2/2019'],
	['Employment Agreements - Employee Collective Employment Agreement 2018-2021', '18/2/2018'],
	['Employment Agreements - Employee Fixed Term Individual Employment Agreement (Bands A-J) - Less than six months', '21/8/2017'],
	['Employment Agreements - Employee Fixed Term Individual Employment Agreement (Bands A-J) - Six months or more', '21/8/2017'],
	['Employment Agreements - Police Managers Collective Agreement Grades 21-24 (2019 -2022)', '20/5/2020'],
	['Employment Agreements - Police Managers Individual Employment Agreement ', '20/5/2020'],
	['Employment Agreements - Recruit fixed term individual employment agreement', '1/7/2020'],
	['Employment movements ', '21/8/2020'],
	['Employment relationship problems', '31/3/2010'],
	['Establishing Maori Advisory Boards', '16/4/2014'],
	['Executive Remuneration Policy ', '4/3/2019'],
	['Exhibits and property - Custody and disposal of exhibits ', '25/6/2020'],
	['Exhibits and property - Disposal of found property ', '25/6/2020'],
	['Exhibits and property - Disposal of non-Police firearms', '9/12/2020'],
	['Exhibits and property - Introduction to Exhibit and property management', '25/6/2020'],
	['Exhibits and property - Packaging, handling, and storage of exhibits', '25/6/2020'],
	['Exhibits and property - Receiving property and exhibits', '25/6/2020'],
	['Exhibits and property - Reporting and internal control checks', '20/6/2020'],
	['Exhumations and offences involving exhumation, burial and cremation', '24/10/2018'],
	['Exotic disease or pest incursions', '27/9/2017'],
	['Expert evidence - drugs and gangs', '7/11/2019'],
	['Extraditions', '28/5/2018'],
	['Family harm - Information sharing guidelines', '9/7/2019'],
	['Family harm - Parental control (s59 Crimes Act)', '15/8/2018'],
	['Family harm - Police family violence death reviews', '16/6/2021'],
	['Family harm - Police safety orders', '1/7/2019'],
	['Family harm - Protection and related property orders', '1/7/2019'],
	['Family harm - Victim relocations', '2/2/2018'],
	['Family harm policy and procedures', '1/7/2019'],
	['Family Harm Quality Assurance and Improvement Framework ', '4/4/2019'],
	['Family Violence Information Disclosure Scheme', '1/8/2017'],
	['Fare evasion', '6/9/2019'],
	['Financial assistance on transfers', '12/4/2021'],
	['Financial delegations', '24/5/2021'],
	['Finding space debris or equipment', '14/6/2019'],
	['Fingerprints and SOCO laboratory and crime scene safety', '7/5/2018'],
	['Fingerprints-biometric', '26/7/2021'],
	['Fireworks', '12/10/2018'],
	['First aid training and equipment', '23/11/2017'],
	['Fisheries protection', '25/7/2017'],
	['Fixed assets', '5/4/2022'],
	['Fleeing driver policy', '9/12/2020'],
	['Flexible Employment Policy ', '11/3/2019'],
	['Forced and under-age marriages', '26/6/2018'],
	['Forensic - Accelerants or volatile substances', '25/5/2017'],
	['Forensic - Anthropology (forensic anthropology)', '25/5/2017'],
	['Forensic - Bite marks and dental evidence', '25/5/2017'],
	['Forensic - Blood pattern analysis and interpretation', '25/5/2017'],
	['Forensic - Compusketch facial identification system', '25/5/2017'],
	['Forensic - Crime scene examination', '15/10/2018'],
	['Forensic - DNA evidence at crime scenes', '25/5/2017'],
	['Forensic - DNA Sampling', '2/7/2019'],
	['Forensic - Document examination', '11/10/2018'],
	['Forensic - Drugs at crime scenes', '25/5/2017'],
	['Forensic - Dye traps', '25/5/2017'],
	['Forensic - Fibres and hair', '25/5/2017'],
	['Forensic - Firearm discharge residues', '25/5/2017'],
	['Forensic - Firearms evidence', '25/5/2017'],
	['Forensic - Footwear evidence', '25/5/2017'],
	['Forensic - Forensic contacts and services', '23/2/2021'],
	['Forensic - Glass', '25/5/2017'],
	['Forensic - Insects (entomology)', '25/5/2017'],
	['Forensic - Kits for collecting evidence samples', '25/5/2017'],
	['Forensic - Knots', '25/5/2017'],
	['Forensic - Microanalysis', '25/5/2017'],
	['Forensic - Paint', '25/5/2017'],
	['Forensic - Physical or mechanical fits', '25/5/2017'],
	['Forensic - Pollen', '25/5/2017'],
	['Forensic - Preservation and recovery of electronic evidence ', '12/12/2019'],
	['Forensic - Serial number restoration', '25/5/2017'],
	['Forensic - Tool marks', '25/5/2017'],
	['Forensic - Toxicology', '25/5/2017'],
	['Forensic mapping', '14/3/2019'],
	['Formal warnings', '21/12/2021'],
	['Found and recovered jewellery', '1/12/2017'],
	['Fraud and corruption', '7/6/2019'],
	['Fringe benefit taxation', '27/6/2017'],
	['Full time study assistance ', '22/5/2014'],
	['Gambling and lotteries', '25/2/2016'],
	['Gang Insignia in government premises', '12/2/2021'],
	['Gifts, discounts and hospitality', '2/9/2019'],
	['Goods and services tax', '27/6/2017'],
	['Government indemnity for important exhibitions', '12/5/2021'],
	['Harassment Act caution letters ', '24/4/2020'],
	['Hazard and risk management', '22/8/2019'],
	['Hazardous substances management', '2/10/2019'],
	['Head injuries ', '1/5/2017'],
	['Health and safety worker engagement, participation and representation', '29/11/2017'],
	['Health clearance at the border', '25/7/2017'],
	['Health standards for constables', '4/6/2021'],
	['High Visibility Safety Garments', '27/8/2020'],
	['Historical and cultural heritage of New Zealand', '2/10/2017'],
	['Home workers health and safety guidelines', '5/5/2020'],
	['Homicide - Part 01 Initial response ', '15/5/2017'],
	['Homicide - Part 02 Role of the OC Investigations ', '13/4/2018'],
	['Homicide - Part 03 Crime scene management', '15/5/2017'],
	['Homicide - Part 04 Search (for bodies of victims)', '15/5/2017'],
	['Homicide - Part 05 Victims', '15/5/2017'],
	['Homicide - Part 06 Family liaison', '15/5/2017'],
	['Homicide - Part 07 Media strategy ', '15/5/2017'],
	['Homicide - Part 08 General enquiries ', '15/5/2017'],
	['Homicide - Part 09 Area canvass enquiries ', '15/5/2017'],
	['Homicide - Part 10 Witness management ', '15/5/2017'],
	['Homicide - Part 11 Passive data generators ', '15/5/2017'],
	['Homicide - Part 12 Role of the OC Suspects (persons of interest) ', '15/5/2017'],
	['Homicide - Part 13 Role of the Second-In-Charge (2IC) ', '15/5/2017'],
	['Homicide - Part 14 File management ', '15/5/2017'],
	['Homicide - Part 15 Criminal disclosure ', '15/5/2017'],
	['Homicide - Part 16 Exhibit management ', '1/2/2021'],
	['Homicide - Part 17 Intelligence ', '15/5/2017'],
	['Homicide - Part 18 Oversight, reviews and debriefs ', '18/2/2021'],
	['Homicide - Part 19 Legal considerations', '15/5/2017'],
	['Honours awards and commendations', '22/5/2008'],
	['Housing for employees ', '25/3/2015'],
	['Human Sources - Part 01 Introduction to Police Human Sources', '28/7/2016'],
	['Human Sources - Part 02 Police Human Sources recruitment and registration', '28/7/2016'],
	['Human Sources - Part 03 Police Human Sources management', '28/7/2016'],
	['Human Sources - Part 04 Police Human Sources - CHIS tasking', '28/7/2016'],
	['Human Sources - Part 05 Police Human Sources - CHIS rewards', '28/7/2016'],
	['Human Sources - Part 06 Police Human Sources - Administration and security', '28/7/2016'],
	['Human Sources - Part 07 Police Human Sources related roles and responsibilities', '28/7/2016'],
	['Human Sources - Part 08 Police Human Sources information in warrants, orders and disclosure', '28/7/2016'],
	['Human Sources - Part 09 Police Human Sources Compromise National Response Model', '28/7/2016'],
	['Identification of offenders', '31/5/2018'],
	['Identifying drivers with face coverings', '3/4/2019'],
	['Identifying particulars for summons ', '5/6/2018'],
	['Identity information sharing', '15/4/2019'],
	['Illness related absences', '3/9/2018'],
	['Impounding vehicles', '13/9/2019'],
	['Improvised explosive devices and bomb incidents', '17/4/2018'],
	['Information and records management procedures PNHQ and RNZPC', '19/9/2017'],
	['Information security - Acceptable use of information and ICT', '21/8/2019'],
	['Information security - Electronic redaction and disclosure', '21/8/2019'],
	['Information security - Email and Text messages', '21/8/2019'],
	['Information security - ICT projects and service delivery ', '21/8/2019'],
	['Information security - Information classification and protection', '21/8/2019'],
	['Information security - Information security', '21/8/2019'],
	['Information security - Information security roles and responsibilities', '21/8/2019'],
	['Information security - People Managers', '21/8/2019'],
	['Information security - Third party access to the Secure Digital Radio Network (SDRN)', '21/8/2019'],
	['Information security - Working with information classified CONFIDENTIAL and above', '21/8/2019'],
	['Insurances', '25/2/2021'],
	['Intel - Collection management', '6/3/2015'],
	['Intel - Crimestoppers', '29/1/2021'],
	['Intel - Decision-making and planning', '6/3/2015'],
	['Intel - Intelligence categories', '6/3/2015'],
	['Intel - Intelligence products', '8/3/2016'],
	['Intel - Introduction to Intelligence', '6/3/2015'],
	['Intel - Selection of operation names', '28/2/2022'],
	['Intel - The Intelligence cycle', '6/3/2015'],
	['Internal control', '7/9/2021'],
	['Interpol', '2/7/2021'],
	['Interpreting for the deaf', '19/11/2018'],
	['Interpreting Services - Ezispeak (previously Language Line)', '25/6/2020'],
	['Investigation of critical incidents', '2/8/2021'],
	['Investigative interviewing - Specialist child witness interview guidelines ', '29/11/2018'],
	['Investigative interviewing - suspects requiring special consideration', '7/6/2017'],
	['Investigative interviewing - witnesses requiring special consideration', '11/10/2016'],
	['Investigative interviewing accreditation policy', '11/10/2016'],
	['Investigative interviewing suspect guide', '7/6/2017'],
	['Investigative interviewing witness guide', '28/5/2019'],
	['Inviting the Commissioner or a member of the Executive to an event', '20/11/2018'],
	['Inviting the Prime Minister, Ministers of the Crown, or Governor General to an event', '9/4/2018'],
	['Kidnapping for ransom (open access version)', '21/6/2017'],
	['Kidnapping for ransom (QID access only)', '21/6/2017'],
	['Leave management policy', '15/4/2019'],
	['Leave without pay', '12/1/2018'],
	['Leaving police on health grounds', '11/9/2013'],
	['Load security', '23/7/2019'],
	['Management of observers', '3/12/2020'],
	['Managing a Police process', '7/8/2017'],
	['Managing conflicts of interest', '5/2/2020'],
	['Managing Corrections prisoners', '31/8/2016'],
	['Managing fatigue related risk', '24/4/2017'],
	['Managing Youth development client information', '8/7/2021'],
	['Market rate policy', '2/2/2008'],
	['Match-fixing', '30/5/2017'],
	['Media - Dealing with the media', '15/1/2020'],
	['Media - Media access to Police property or characters', '10/9/2015'],
	['Media - Media filming of Police operations', '15/1/2020'],
	['Media - Media interviews', '15/1/2020'],
	['Media - News releases ', '10/9/2015'],
	['Media - Online channels - web, intranet, social media and video', '29/7/2016'],
	['Media - Releasing information to the media', '21/1/2020'],
	['Media - Releasing information to the media after a sudden death', '20/2/2014'],
	['Media - Social media policy', '28/6/2021'],
	['Media - Sponsorship', '3/2/2015'],
	['Media - Sub judice', '14/12/2015'],
	['Media - The electronic bulletin board', '8/10/2013'],
	['Media - TikTok', '16/4/2020'],
	['Media - Visual identity', '9/10/2013'],
	['Missing persons', '16/6/2017'],
	['Mobile phone enforcement and use in Police vehicles', '3/4/2019'],
	['Motor vehicle noise enforcement', '3/4/2019'],
	['Motor vehicle registration and licensing', '13/3/2017'],
	['National recording standard', '29/3/2022'],
	['New Zealand Bill of Rights', '10/10/2017'],
	['New Zealand Police Library (Kai)', '14/8/2019'],
	['New Zealand Police Museum collection management policy', '17/11/2020'],
	['Night vision equipment', '15/12/2020'],
	['No surprises policy', '5/9/2019'],
	['Nomex hoods', '14/12/2017'],
	['Non-Police firearms security management', '2/4/2020'],
	['Non-violence programmes and prescribed services ', '2/7/2019'],
	['Non-work related injuries', '31/8/2018'],
	['Notebooks and Job sheets', '6/7/2018'],
	['Objectionable publications', '12/9/2017'],
	['OCEANZ operations (QID access only)', '1/3/2018'],
	['Off-duty interventions', '24/3/2022'],
	['Offence notices', '18/7/2019'],
	['Offensive weapons, knives and disabling substances', '2/2/2021'],
	['Officer Safety Alarms', '13/9/2016'],
	['Output costing policy', '5/7/2017'],
	['Overseas assignment policy', '28/1/2021'],
	['Parental Leave Policy and Parental Guidelines ', '8/7/2020'],
	['Parole and other community based sentences and orders', '23/8/2019'],
	['Part time study assistance', '22/9/2008'],
	['Partnership between community groups and police', '4/1/2017'],
	['PAYE and withholding tax', '29/6/2017'],
	['People in Police custody', '8/3/2021'],
	['People trafficking and migrant smuggling', '24/6/2015'],
	['People Unlawfully in New Zealand', '4/3/2015'],
	['People with mental impairments', '7/3/2017'],
	['Performance management', '4/9/2013'],
	['Perjury', '24/2/2020'],
	['Personation of Police and related offences', '7/11/2017'],
	['Photography (Forensic imaging)', '11/6/2018'],
	['Point duty', '10/7/2019'],
	['Police air operations', '29/1/2018'],
	['Police chaplaincy services', '1/5/2017'],
	['Police cultural groups', '12/5/2015'],
	['Police deployability', '28/1/2022'],
	['Police Dogs - Pt 01 General information for Police employees about Police dogs', '8/10/2020'],
	['Police Dogs - Pt 02 New Zealand Police Dog Section', '8/10/2020'],
	['Police Dogs - Pt 03 Dog Section staff management', '8/10/2020'],
	['Police Dogs - Pt 04 Dog management', '10/8/2017'],
	['Police Dogs - Pt 05 Dog Team Training', '8/10/2020'],
	['Police Dogs - Pt 06 Certification of Police dogs', '8/10/2020'],
	['Police Dogs - Pt 07 Dog displays', '8/10/2020'],
	['Police Dogs - Pt 08 Use of force and Police dogs', '8/10/2020'],
	['Police Dogs - Pt 09 Dog deployment exercises with Defence and other agencies', '8/10/2020'],
	['Police drug and alcohol policy ', '2/2/2022'],
	['Police exercises', '4/5/2017'],
	['Police filming and audio recording of operations and events', '10/9/2020'],
	['Police governance and leadership ', '17/8/2020'],
	['Police identity cards', '20/4/2021'],
	['Police information and records management policy', '1/12/2021'],
	['Police Instructions Policy', '7/3/2019'],
	['Police Integrated Tactical Training (PITT)', '4/8/2021'],
	['Police Interagency Agreements Policy', '15/2/2022'],
	['Police investigations of complaints and notifiable incidents', '28/4/2020'],
	['Police Medical Officers ', '23/7/2019'],
	['Police National Dive Squad (PNDS)', '24/6/2021'],
	['Police negotiators', '8/3/2017'],
	['Police property management', '6/8/2021'],
	['Police Prosecution Service - Statement of policy and practice', '21/11/2016'],
	['Police response to bullying of children and young people', '3/9/2019'],
	['Police response to cyberbullying and the Harmful Digital Communications Act', '15/9/2021'],
	['Police vehicle management', '17/5/2018'],
	['Police Vetting Service', '20/1/2022'],
	['Police volunteers', '14/2/2017'],
	['Policing in the maritime environment', '1/6/2017'],
	['Policing Outlaw Motorcycle Gang Runs', '28/1/2021'],
	['Policy and guidelines for storage of physical files', '31/8/2021'],
	['Policy permitting destruction of certain paper-based offence reports', '27/7/2021'],
	['Policy, practice and procedure reviews', '3/5/2018'],
	['Posting rewards for investigations', '14/7/2017'],
	['Preparing ministerial briefing papers', '20/3/2018'],
	['Prisoner Escort and Transport Manual', '22/2/2017'],
	['Privacy and official information  - Disclosure under the Privacy Act 2020', '1/12/2020'],
	['Privacy and official information -  Introduction to disclosure of information', '1/12/2020'],
	['Privacy and official information - Applying the Criminal Records (Clean Slate) Act 2004', '1/12/2020'],
	['Privacy and official information - Collection of personal information ', '1/12/2020'],
	['Privacy and official information - Community disclosure of offender information', '1/12/2020'],
	['Privacy and official information - Disclosure under the Official Information Act 1982 (OIA)', '1/12/2020'],
	['Privacy and official information - Information Privacy Principles (IPPs)', '1/12/2020'],
	['Privacy and official information - Privacy breach management ', '1/12/2020'],
	['Privacy and official information - Privacy Impact Assessments - Privacy by design', '1/12/2020'],
	['Private Investigators and Security Consultants requests to Police for assistance', '23/11/2020'],
	['Private Security Personnel and Private Investigators', '28/11/2017'],
	['Probationary Constables Policy', '5/7/2021'],
	['Procurement - Pt 1 Introduction to Police procurement', '18/9/2018'],
	['Procurement - Pt 2 Existing contracts', '18/9/2018'],
	['Procurement - Pt 3 Sourcing', '18/9/2018'],
	['Procurement - Pt 4 Legislative and environmental considerations', '18/9/2018'],
	['Procurement - Pt 5 More about us', '18/9/2018'],
	['Professional Police Driver Programme (PPDP)', '6/9/2018'],
	['Property damage, endangering, contamination and waste', '23/11/2017'],
	['Prosecuting family violence', '2/7/2019'],
	['Prosecution file and trial preparation ', '16/9/2015'],
	['Protected disclosures ', '12/11/2018'],
	['Protected voluntary military service or training', '14/7/2020'],
	['Psychometric assessments', '27/9/2011'],
	['Public Order Policing - Pt01 Introduction to Public Order Management', '3/3/2016'],
	['Public Order Policing - Pt02 Police Support Units', '3/3/2016'],
	['Public Order Policing - Pt03 Public Order Intervention Model', '3/3/2016'],
	['Public Order Policing - Pt04 Noise Control', '3/3/2016'],
	['Public Order Policing - Pt05 Out of Control Gatherings', '3/3/2016'],
	['Public Order Policing - Pt06 Behaviour Offences', '3/3/2016'],
	['Public Order Policing - Pt07 Unlawful Assembly and-or Rioting', '3/3/2016'],
	['Public Order Policing - Pt08 Demonstrations', '3/3/2016'],
	['Public Order Policing - Pt09 Policing Parliamentary Precincts', '3/3/2016'],
	['Public Order Policing - Pt10 Mass Arrest Planning', '3/3/2016'],
	['Public Order Policing - Pt11 Public Order Protection Equipment', '3/3/2016'],
	['Radio and Emergency Communications Centre Protocols', '6/9/2018'],
	['Ranks (position levels) for constabulary employees (policy and guidelines)', '10/3/2016'],
	['Receiving', '13/4/2018'],
	['Recording and reviewing health and safety events', '21/8/2019'],
	['Recruitment policy', '9/2/2021'],
	['Rehabilitation policy and procedures', '9/10/2020'],
	['Reimbursing dependant care expenses', '16/8/2012'],
	['Rejoining Police ', '17/1/2018'],
	['Relief management of rural stations', '21/1/2022'],
	['Remotely Piloted Aircraft Systems (RPAS)', '7/12/2020'],
	['Remuneration policy', '2/7/2009'],
	['Restructuring', '14/2/2008'],
	['Retention and disposal of Police records', '12/2/2021'],
	['Returning Offenders Management and Information Regime ', '24/4/2017'],
	['Review of appointments', '17/10/2017'],
	['Rights caution', '23/7/2019'],
	['Risk Management Policy', '8/4/2019'],
	['Road user charges', '3/4/2019'],
	['Roadside incidents', '7/8/2019'],
	['Robbery', '23/11/2017'],
	['Salary overpayment recovery policy', '4/4/2011'],
	['School Community Policing', '3/7/2017'],
	['Search and Rescue operations', '12/8/2021'],
	['Search Part 01 - Search introduction', '10/11/2020'],
	['Search Part 02 - Search warrants ', '10/11/2020'],
	['Search Part 03 - Warrantless powers to search places, vehicles and things', '31/5/2021'],
	['Search Part 04 - Consent searches', '11/11/2020'],
	['Search Part 05 - Carrying out search powers with or without warrants ', '11/11/2020'],
	['Search Part 06  - Roadblocks and stopping vehicles for search purposes ', '24/2/2021'],
	['Search Part 07 - Methods for searching places and vehicles', '11/2/2021'],
	['Search Part 08 - Searching people', '28/1/2022'],
	['Search Part 09 - Production orders', '12/11/2020'],
	['Search Part 10 - Examination orders', '11/11/2020'],
	['Search Part 11 - Declaratory orders', '12/11/2020'],
	['Search Part 12 - Procedures applying to seized and produced things ', '12/11/2020'],
	['Search Part 13 - Privilege and immunities under the Act ', '12/11/2020'],
	['Search Part 14 - Reporting', '11/11/2020'],
	['Search Part 15 - Government agency requests for assistance with search warrants', '7/12/2021'],
	['Search Part 16 - Property damage incurred during searches or exercise of statutory powers', '26/1/2021'],
	['Secondary employment', '3/8/2018'],
	['Security of private premises', '7/5/2018'],
	['Sensitive expenditure policy', '16/9/2021'],
	['Serious crash investigation review', '30/10/2015'],
	['Service Delivery Guidelines for Policing Interactions ', '7/10/2019'],
	['Sexual offences', '7/2/2018'],
	['Sick leave ', '30/7/2019'],
	['Situational Awareness Map (SAM) and Deployment and Safety app (DaS)', '28/3/2019'],
	['Smoke-free workplace policy', '19/6/2019'],
	['Smoking in motor vehicles (carrying children)', '1/12/2021'],
	['Social Networking, Open Source Information and Online Practitioner', '27/8/2018'],
	['Solicitor General\'s Prosecution Guidelines', '5/2/2015'],
	['Special Tactics Group (STG)', '27/9/2017'],
	['Specialist Search Group', '30/8/2017'],
	['Specialist work group health, safety and wellness self-assessments', '26/5/2021'],
	['Speed enforcement', '1/6/2021'],
	['Sports within Police', '16/6/2020'],
	['Stab Resistant Body Armour (SRBA) policy', '4/5/2020'],
	['Statutory declarations', '27/2/2018'],
	['STG Required physical fitness policy', '3/8/2012'],
	['Sudden death', '13/8/2021'],
	['Surveillance - Categories of surveillance with a device', '22/8/2018'],
	['Surveillance - Introduction', '22/8/2018'],
	['Surveillance - Privilege and immunities involving surveillance', '7/8/2018'],
	['Surveillance - Retention & destruction of surveillance data & documents', '6/8/2018'],
	['Surveillance - Surveillance by radar and from aircraft, drones etc', '22/8/2018'],
	['Surveillance - Surveillance device warrants', '2/10/2018'],
	['Surveillance - Surveillance reporting', '12/9/2018'],
	['Surveillance - Surveillance squad', '23/2/2021'],
	['Tasking and coordination', '24/8/2012'],
	['Te Pae Oranga', '10/6/2020'],
	['Technical Operations Group (TOG)', '31/1/2018'],
	['Telecommunication investigations', '21/1/2020'],
	['TENR Operational threat assessment', '19/10/2015'],
	['Theft', '31/5/2021'],
	['Threats against the Police and the judiciary', '8/12/2021'],
	['Three stage warning regime (\'3 strikes\')', '15/8/2018'],
	['TOIL management', '25/9/2019'],
	['Towing and storing privately owned motor vehicles', '27/11/2018'],
	['Traffic compliance scheme', '30/5/2017'],
	['Traffic control at special events', '15/2/2016'],
	['Traffic crashes', '8/10/2019'],
	['Traffic patrol techniques', '10/2/2022'],
	['Transnational technology enabled crime - Advice for investigators ', '15/9/2021'],
	['Transport Service Licence', '1/3/2019'],
	['Trauma support policy', '28/11/2019'],
	['Travel policy', '15/4/2021'],
	['Trespass', '15/12/2021'],
	['Trial or adoption of new policing technology', '17/2/2022'],
	['Tyre deflation devices', '6/9/2018'],
	['Unacceptable behaviour - Kia Tu policy and guidelines ', '9/2/2021'],
	['Undercover policing', '4/2/2019'],
	['Uniform, dress standards and appearance', '13/8/2021'],
	['Unpublished names on the electoral roll', '10/10/2017'],
	['Urgent after hours contact with PNHQ', '23/2/2018'],
	['Urgent Duty Driving', '16/8/2019'],
	['Use of Force - Approved tactical equipment and carriage for constables and Authorised Officers (non specialist)', '4/2/2021'],
	['Use of Force - Batons', '26/10/2017'],
	['Use of Force - CS Gas ', '6/10/2020'],
	['Use of Force - eXact Impact QX1006 (Less lethal option)', '3/6/2021'],
	['Use of Force - Mechanical restraints', '31/1/2022'],
	['Use of Force - Oleoresin Capsicum spray', '26/10/2017'],
	['Use of Force - Police firearms', '18/3/2020'],
	['Use of Force - Positional asphyxia', '28/1/2022'],
	['Use of Force - TASER (Conducted Electrical Weapons)', '23/9/2020'],
	['Use of Force - Use of Force Overview', '26/10/2017'],
	['Vaccination Status Management Policy', '29/3/2022'],
	['Vehicle crash data recording devices', '16/8/2019'],
	['Vehicle crime', '22/3/2018'],
	['Vehicle dimensions and mass', '10/7/2019'],
	['Vehicle inspections', '10/7/2019'],
	['Victims (Police service to victims)', '5/12/2019'],
	['Victims\' orders against violent offenders (Non-contact orders) ', '21/9/2018'],
	['VIP security planning and operations', '13/8/2021'],
	['Wellcheck support policy', '9/11/2017'],
	['Wellness Policy', '14/11/2019'],
	['Wheel clamping', '12/12/2017'],
	['Witness protection', '10/6/2019'],
	['Work related injuries', '31/8/2018'],
	['Working at height ', '29/11/2017'],
	['Working with community patrols', '5/10/2018'],
	['Written Traffic Warnings', '20/5/2021'],
	['Youth justice - Part 1 Introduction to youth justice ', '20/5/2020'],
	['Youth justice - Part 2  Responding to youth offending and related issues ', '20/5/2020'],
	['Youth justice - Part 3 Criminal procedure in the Youth Court', '20/5/2020'],
];

/**
 * Some names have formatting errors that need to be corrected
 */
function fixName(originalName: string): string {
	const name = originalName
		.replace('DealersTraders-', 'Dealers Traders - ')
		.replace(/Maori/g, 'Māori')
		.replace('Unacceptable behaviour - Kia Tu policy and guidelines', 'Unacceptable behaviour - Kia Tū policy and guidelines')
		.replace(' (open access version)', '')
		.replace(' (QID access only)', '')
	;

	return name;
}

/**
 * Date strings are provided as D/M/YYYY. Convert them to YYYY-MM-DD
 */
function fixDateFormat(dateString: string): string {
	const dateParts = dateString.match(/^(\d+)\/(\d+)\/(\d+)$/);

	if (!dateParts) {
		throw new TypeError(`ERROR: Unexpected date string format ${dateString}`);
	}

	const [, day, month, year] = dateParts;

	const correctDateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

	return correctDateString;
}

const stubsSourceFixed = stubsSource.map(([name, date]) => [
	fixName(name),
	fixDateFormat(date),
]);

// Some items shouldn't have stubs created
const excludedNames = ['Disciplinary Policy (and associated \'Disciplinary Process guidelines)'];
const stubsSourceFiltered = stubsSourceFixed.filter(([name]) => !excludedNames.includes(name));

const provenance: Provenance = {
	source: ProvenanceSource.NZ_POLICE,
		method: ProvenanceMethod.RELEASED_UNDER_THE_OIA,
		oiaRequest: {
			requester: 'Mark Hanna',
			id: 'IR-01-22-11586',
			responseUrl: 'https://fyi.org.nz/request/19200-police-policy-documents#incoming-74199',
			withholdings: OIAWithholdingsSummary.NONE,
		},
		extracted: '2022-05-22',
		released: '2022-06-13',
		retrieved: '2022-06-18',
		url: 'https://fyi.org.nz/request/19200-police-policy-documents#incoming-74199',
		fileUrl: 'https://fyi.org.nz/request/19200/response/74199/attach/2/List%20of%20all%20Police%20Manual%20chapters%20as%20at%20May%202022%20searchable.xlsx',
};

const stubs: StubPolicyWith<StubProps>[] = stubsSourceFiltered.map(([name, date]) => ({
	name,
	versions: [{
		name: date,
		id: generateId(),
		duration: { start: date },
		provenance: [provenance],
		files: [],
	}],
}));

const base: StubPolicyWithout<StubProps> = {
	schemaVersion: '0.5.4',
	type: PolicyType.POLICE_MANUAL_CHAPTER,
	provenance: [provenance],
};

createStubs(stubs, base);

// We can't create new versions for policies that already exist but
// have newer versions in this list because the "publication date"
// column is not reliable. For example, it lists the publication date
// of the OC spray chapter as being in October 2017, but we have versions
// from January 2017 and March 2022 so that can't be either the first
// publication date or the most recent publication date.
