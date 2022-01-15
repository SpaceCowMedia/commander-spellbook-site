import { UnknownError, ValidationError } from "../api/error";
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

      // it should never get here, since the allowed kinds
      // are checked before this function runs
      throw new UnknownError("Unexpected rule kind.");
    });
  }

  static updateFeaturedSettings(settings: FeaturedSettings) {
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
}
