export const unitUtils = {
  // Weight conversions
  kgToLbs(kg: number): number {
    return Math.round(kg * 2.20462 * 10) / 10; // Round to 1 decimal place
  },

  lbsToKg(lbs: number): number {
    return Math.round(lbs / 2.20462 * 10) / 10; // Round to 1 decimal place
  },

  // Format weight based on units
  formatWeight(weight: number, units: 'metric' | 'imperial'): string {
    if (units === 'imperial') {
      const lbs = this.kgToLbs(weight);
      return `${lbs} lbs`;
    }
    return `${weight} kg`;
  },

  // Get weight input placeholder
  getWeightPlaceholder(units: 'metric' | 'imperial'): string {
    return units === 'imperial' ? 'Enter weight in lbs' : 'Enter weight in kg';
  },

  // Convert weight input to kg for storage
  convertWeightToKg(weight: number, units: 'metric' | 'imperial'): number {
    if (units === 'imperial') {
      return this.lbsToKg(weight);
    }
    return weight;
  },

  // Convert weight from kg for display
  convertWeightFromKg(weightKg: number, units: 'metric' | 'imperial'): number {
    if (units === 'imperial') {
      return this.kgToLbs(weightKg);
    }
    return weightKg;
  },

  // Get weight unit label
  getWeightUnit(units: 'metric' | 'imperial'): string {
    return units === 'imperial' ? 'lbs' : 'kg';
  },

  // Get weight unit label for input
  getWeightUnitLabel(units: 'metric' | 'imperial'): string {
    return units === 'imperial' ? 'Weight (lbs)' : 'Weight (kg)';
  }
};


