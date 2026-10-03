import type { Lang } from "./mockData";

type TranslationKeys = {
  dashboard: string; instruments: string; applications: string; certificates: string;
  complaints: string; notifications: string; profile: string; logout: string;
  register: string; payments: string; inspections: string; aiAssistant: string;
  instrumentPassport: string; myAssignments: string; scanInstrument: string;
  fieldVerification: string; instrumentHistory: string; measurementAnalysis: string;
  fraudDetection: string; geoMap: string; analytics: string; auditLogs: string;
  users: string; officers: string; reports: string; settings: string;
  welcome: string; status: string; submit: string; cancel: string; search: string;
  filter: string; export: string; approve: string; reject: string;
  totalInstruments: string; verified: string; pending: string; expired: string;
  complianceScore: string; riskScore: string; assignedCases: string;
  completedInspections: string; highRiskCases: string; todayInspections: string;
  certVerify: string; advancedAnalytics: string;
};

const en: TranslationKeys = {
  dashboard: "Dashboard", instruments: "My Instruments", applications: "Applications",
  certificates: "Certificates", complaints: "Complaints", notifications: "Notifications",
  profile: "Profile", logout: "Logout", register: "Register Instrument",
  payments: "Payments", inspections: "Inspections", aiAssistant: "AI Assistant",
  instrumentPassport: "Instrument Passport", myAssignments: "My Assignments",
  scanInstrument: "Scan Instrument", fieldVerification: "Field Verification",
  instrumentHistory: "Instrument History", measurementAnalysis: "Measurement Analysis",
  fraudDetection: "Fraud Detection", geoMap: "Geo Map", analytics: "Analytics",
  auditLogs: "Audit Logs", users: "Users", officers: "Officers",
  reports: "Reports", settings: "Settings", welcome: "Welcome",
  status: "Status", submit: "Submit", cancel: "Cancel", search: "Search",
  filter: "Filter", export: "Export", approve: "Approve", reject: "Reject",
  totalInstruments: "Total Instruments", verified: "Verified", pending: "Pending",
  expired: "Expired", complianceScore: "Compliance Score", riskScore: "Risk Score",
  assignedCases: "Assigned Cases", completedInspections: "Completed Inspections",
  highRiskCases: "High Risk Cases", todayInspections: "Today's Inspections",
  certVerify: "Verify Certificate", advancedAnalytics: "Advanced Analytics",
};

const hi: TranslationKeys = {
  dashboard: "डैशबोर्ड", instruments: "मेरे उपकरण", applications: "आवेदन",
  certificates: "प्रमाणपत्र", complaints: "शिकायतें", notifications: "सूचनाएं",
  profile: "प्रोफ़ाइल", logout: "लॉग आउट", register: "उपकरण पंजीकृत करें",
  payments: "भुगतान", inspections: "निरीक्षण", aiAssistant: "AI सहायक",
  instrumentPassport: "उपकरण पासपोर्ट", myAssignments: "मेरे असाइनमेंट",
  scanInstrument: "उपकरण स्कैन करें", fieldVerification: "क्षेत्र सत्यापन",
  instrumentHistory: "उपकरण इतिहास", measurementAnalysis: "मापन विश्लेषण",
  fraudDetection: "धोखाधड़ी पहचान", geoMap: "भू-मानचित्र", analytics: "विश्लेषण",
  auditLogs: "ऑडिट लॉग", users: "उपयोगकर्ता", officers: "अधिकारी",
  reports: "रिपोर्ट", settings: "सेटिंग्स", welcome: "स्वागत है",
  status: "स्थिति", submit: "जमा करें", cancel: "रद्द करें", search: "खोजें",
  filter: "फ़िल्टर", export: "निर्यात", approve: "अनुमोदित", reject: "अस्वीकृत",
  totalInstruments: "कुल उपकरण", verified: "सत्यापित", pending: "लंबित",
  expired: "समाप्त", complianceScore: "अनुपालन स्कोर", riskScore: "जोखिम स्कोर",
  assignedCases: "असाइन किए मामले", completedInspections: "पूर्ण निरीक्षण",
  highRiskCases: "उच्च जोखिम", todayInspections: "आज के निरीक्षण",
  certVerify: "प्रमाणपत्र सत्यापित करें", advancedAnalytics: "उन्नत विश्लेषण",
};

const mr: TranslationKeys = {
  dashboard: "डॅशबोर्ड", instruments: "माझी उपकरणे", applications: "अर्ज",
  certificates: "प्रमाणपत्रे", complaints: "तक्रारी", notifications: "सूचना",
  profile: "प्रोफाइल", logout: "लॉग आउट", register: "उपकरण नोंदवा",
  payments: "देयके", inspections: "तपासणी", aiAssistant: "AI सहाय्यक",
  instrumentPassport: "उपकरण पासपोर्ट", myAssignments: "माझ्या नेमणुका",
  scanInstrument: "उपकरण स्कॅन करा", fieldVerification: "क्षेत्र पडताळणी",
  instrumentHistory: "उपकरण इतिहास", measurementAnalysis: "मापन विश्लेषण",
  fraudDetection: "फसवणूक शोध", geoMap: "भू-नकाशा", analytics: "विश्लेषण",
  auditLogs: "ऑडिट लॉग", users: "वापरकर्ते", officers: "अधिकारी",
  reports: "अहवाल", settings: "सेटिंग्ज", welcome: "स्वागत आहे",
  status: "स्थिती", submit: "सादर करा", cancel: "रद्द करा", search: "शोधा",
  filter: "फिल्टर", export: "निर्यात", approve: "मंजूर", reject: "नाकारा",
  totalInstruments: "एकूण उपकरणे", verified: "पडताळलेले", pending: "प्रलंबित",
  expired: "कालबाह्य", complianceScore: "अनुपालन गुण", riskScore: "धोका गुण",
  assignedCases: "नेमलेली प्रकरणे", completedInspections: "पूर्ण तपासण्या",
  highRiskCases: "उच्च धोका प्रकरणे", todayInspections: "आजच्या तपासण्या",
  certVerify: "प्रमाणपत्र सत्यापित करा", advancedAnalytics: "प्रगत विश्लेषण",
};

const translations: Record<Lang, TranslationKeys> = { en, hi, mr };

export function t(lang: Lang, key: keyof TranslationKeys): string {
  return translations[lang][key] ?? translations.en[key];
}
