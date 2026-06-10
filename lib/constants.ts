// JVM's actual service-catalog roles (PRD F1.2) and the DoD deployment sites.
// Used by the Add Staff form so live-added records stay domain-accurate.

export const ROLES = [
  "Registered Nurse",
  "Clinical Social Worker",
  "Case Manager",
  "Nutritionist",
  "Pharmacy Technician",
  "Phlebotomist",
  "Cardiovascular Technologist",
  "MRI Technologist",
  "Medical Laboratory Technician",
] as const;

export const FACILITIES = [
  "Brooke Army Medical Center",
  "Wilford Hall Ambulatory Surgical Center",
  "Naval Medical Center San Diego",
] as const;

// Common credentials, offered as suggestions in the Add Staff form.
export const COMMON_CREDENTIALS = [
  "RN License (TX)",
  "BLS",
  "ACLS",
  "ARRT (MRI)",
  "CCM",
  "PTCB (CPhT)",
  "LCSW (TX)",
  "Phlebotomy (NHA)",
  "MLT (ASCP)",
  "RCIS",
  "RDN",
] as const;
