export type FieldType = "number" | "flag";

export type PredictorValues = {
  koi_period: string;
  koi_impact: string;
  koi_duration: string;
  koi_depth: string;
  koi_prad: string;
  koi_model_snr: string;
  koi_steff: string;
  koi_slogg: string;
  koi_srad: string;
  koi_fpflag_nt: string;
  koi_fpflag_co: string;
  koi_fpflag_ss: string;
  koi_fpflag_ec: string;
};

export type FieldConfig = {
  name: keyof PredictorValues;
  label: string;
  step?: string;
  placeholder: string;
  helper: string;
  type?: FieldType;
};

export type FieldSection = {
  id: string;
  title: string;
  blurb: string;
  fields: FieldConfig[];
};

export const fieldSections: FieldSection[] = [
  {
    id: "transit",
    title: "Transit measurements",
    blurb: "Start with the orbital and transit values you already have.",
    fields: [
      {
        name: "koi_period",
        label: "Orbital period",
        placeholder: "Days",
        helper:
          "How long the candidate takes to orbit its star.",
      },
      {
        name: "koi_impact",
        label: "Impact parameter",
        placeholder: "0.0 to 1.0+",
        helper:
          "How centrally the object appears to cross its star during transit.",
      },
      {
        name: "koi_duration",
        label: "Transit duration",
        placeholder: "Hours",
        helper: "Estimated duration of the transit event in hours.",
      },
      {
        name: "koi_depth",
        label: "Transit depth",
        placeholder: "ppm",
        helper:
          "How much the star brightness dips during transit, often measured in parts per million.",
      },
      {
        name: "koi_prad",
        label: "Planet radius",
        placeholder: "Earth radii",
        helper: "Estimated radius of the object compared with Earth.",
      },
      {
        name: "koi_model_snr",
        label: "Model SNR",
        placeholder: "Signal-to-noise",
        helper:
          "A higher signal-to-noise ratio means the transit detection stands out more clearly from noise.",
      },
    ],
  },
  {
    id: "stellar",
    title: "Host star context",
    blurb: "Add stellar measurements if you have them. They are helpful but optional.",
    fields: [
      {
        name: "koi_steff",
        label: "Stellar temperature",
        placeholder: "Kelvin",
        helper: "Effective temperature of the host star in Kelvin.",
      },
      {
        name: "koi_slogg",
        label: "Surface gravity",
        placeholder: "log(g)",
        helper: "Logarithmic surface gravity of the host star.",
      },
      {
        name: "koi_srad",
        label: "Stellar radius",
        placeholder: "Solar radii",
        helper: "Host star radius compared with the Sun.",
      },
    ],
  },
  {
    id: "flags",
    title: "False-positive flags",
    blurb: "Optional but important: false-positive flags significantly improve the classifier. Without them, test set accuracy dropped from ~99% to ~83%.",
    fields: [
      {
        name: "koi_fpflag_nt",
        label: "Non-transit flag",
        placeholder: "0 or 1",
        helper:
          "Marks whether the signal is suspected to be a non-transit event.",
        type: "flag",
      },
      {
        name: "koi_fpflag_co",
        label: "Centroid offset flag",
        placeholder: "0 or 1",
        helper:
          "Marks whether the transit source appears offset from the target star.",
        type: "flag",
      },
      {
        name: "koi_fpflag_ss",
        label: "Stellar eclipse flag",
        placeholder: "0 or 1",
        helper:
          "Marks whether the dip may come from a stellar eclipse rather than a planet.",
        type: "flag",
      },
      {
        name: "koi_fpflag_ec",
        label: "Ephemeris match flag",
        placeholder: "0 or 1",
        helper:
          "Marks whether the signal matches another known periodic event and may be a false positive.",
        type: "flag",
      },
    ],
  },
];

export const emptyValues: PredictorValues = {
  koi_period: "",
  koi_impact: "",
  koi_duration: "",
  koi_depth: "",
  koi_prad: "",
  koi_model_snr: "",
  koi_steff: "",
  koi_slogg: "",
  koi_srad: "",
  koi_fpflag_nt: "0",
  koi_fpflag_co: "0",
  koi_fpflag_ss: "0",
  koi_fpflag_ec: "0",
};

export const presets: Array<{
  name: string;
  kicker: string;
  note: string;
  values: PredictorValues;
}> = [
  {
    name: "Pluto test",
    kicker: "Dwarf planet or exoplanet?",
    note: "A playful preset testing a dwarf planet from our own system as an exoplanet candidate.",
    values: {
      koi_period: "90560",
      koi_impact: "0.93",
      koi_duration: "7.8",
      koi_depth: "85",
      koi_prad: "0.186",
      koi_model_snr: "2.4",
      koi_steff: "5778",
      koi_slogg: "4.44",
      koi_srad: "1",
      koi_fpflag_nt: "1",
      koi_fpflag_co: "0",
      koi_fpflag_ss: "0",
      koi_fpflag_ec: "1",
    },
  },
  {
    name: "Likely exoplanet",
    kicker: "Cleaner transit signal",
    note: "A more planet-like candidate with a compact orbit and stronger transit signal.",
    values: {
      koi_period: "12.41",
      koi_impact: "0.18",
      koi_duration: "3.5",
      koi_depth: "950",
      koi_prad: "2.3",
      koi_model_snr: "18.6",
      koi_steff: "5610",
      koi_slogg: "4.38",
      koi_srad: "0.94",
      koi_fpflag_nt: "0",
      koi_fpflag_co: "0",
      koi_fpflag_ss: "0",
      koi_fpflag_ec: "0",
    },
  },
  {
    name: "Likely not exoplanet",
    kicker: "Just to double-check",
    note: "A shakier observation with weak evidence and multiple warning flags.",
    values: {
      koi_period: "44.3",
      koi_impact: "1.23",
      koi_duration: "1.6",
      koi_depth: "70",
      koi_prad: "14.5",
      koi_model_snr: "1.9",
      koi_steff: "6400",
      koi_slogg: "3.8",
      koi_srad: "1.9",
      koi_fpflag_nt: "1",
      koi_fpflag_co: "1",
      koi_fpflag_ss: "1",
      koi_fpflag_ec: "0",
    },
  },
];
