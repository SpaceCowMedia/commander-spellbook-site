import DocumentBase from "./document-base";

const ALLOWED_RULE_KINDS = ["card"];
const FEATURED_ID = "featured-combos";

type FeaturedRule = {
  kind: "card";
  setCode?: string;
  cardName?: string;
};
type FeaturedSettings = {
  buttonText: string;
  rules: FeaturedRule[];
};

export default class SiteSetting extends DocumentBase {
  static CollectionName = "site-settings";

  private static hasRequiredSettings({
    buttonText,
    rules,
  }: FeaturedSettings): boolean {
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

  private static hasValidRules(rules: FeaturedRule[]) {
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

  private static sanitizeRules(rules: FeaturedRule[]): FeaturedRule[] {
    return rules.map((rule) => {
      switch (rule.kind) {
        case "card":
          return {
            kind: rule.kind,
            setCode: String(rule.setCode || ""),
            cardName: String(rule.cardName || ""),
          };
      }

      throw new Error("Unexpected kind");
    });
  }

  static updateFeaturedSettings(settings: FeaturedSettings) {
    if (!this.hasRequiredSettings(settings)) {
      return Promise.reject(new Error("Missing buttonText or rules"));
    }

    if (!this.hasValidRules(settings.rules)) {
      return Promise.reject(new Error("Rules malformed."));
    }

    const buttonText = String(settings.buttonText);
    const rules = this.sanitizeRules(settings.rules);

    return this.update(FEATURED_ID, {
      buttonText,
      rules,
    });
  }
}
