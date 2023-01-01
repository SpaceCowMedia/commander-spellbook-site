const { UnknownError, ValidationError } = require("../api/error");
const DocumentBase = require("./document-base");

const ALLOWED_RULE_KINDS = ["card"];
const FEATURED_ID = "featured-combos";

// type FeaturedRule = {
//   kind: "card";
//   setCode?: string;
//   cardName?: string;
// };
// type FeaturedSettings = {
//   buttonText: string;
//   rules: FeaturedRule[];
// };

module.exports = class SiteSetting extends DocumentBase {
  static CollectionName = "site-settings";

  // private
  // @returns boolean
  static hasRequiredSettings({ buttonText, rules }) {
    if (!buttonText) {
      return false;
    }
    if (!Array.isArray(rules)) {
      return false;
    }
    if (rules.length === 0) {
      return false;
    }

    return true;
  }

  // private
  // @arg rules: FeaturedRule[]
  // @returns boolean
  static hasValidRules(rules) {
    return rules.every((rule) => {
      const hasValidKind = ALLOWED_RULE_KINDS.includes(rule.kind);

      if (!hasValidKind) {
        return false;
      }

      switch (rule.kind) {
        case "card":
          return rule.setCode || rule.cardName;
      }

      return false;
    });
  }

  // private
  // @arg rules: FeaturedRule[]
  // @returns FeaturedRule[]
  static sanitizeRules(rules) {
    return rules.map((rule) => {
      switch (rule.kind) {
        case "card":
          return {
            kind: rule.kind,
            setCode: String(rule.setCode || "").toLowerCase(),
            cardName: String(rule.cardName || ""),
          };
      }

      // it should never get here, since the allowed kinds
      // are checked before this function runs
      throw new UnknownError("Unexpected rule kind.");
    });
  }

  // @arg FeaturedSettings
  // @returns void
  static updateFeaturedSettings(settings) {
    if (!this.hasRequiredSettings(settings)) {
      return Promise.reject(
        new ValidationError("Featured combos is missing buttonText or rules.")
      );
    }

    if (!this.hasValidRules(settings.rules)) {
      return Promise.reject(
        new ValidationError("At least one featured combo rule is malformed.")
      );
    }

    const buttonText = String(settings.buttonText);
    const rules = this.sanitizeRules(settings.rules);

    return this.update(FEATURED_ID, {
      buttonText,
      rules,
    });
  }
};
