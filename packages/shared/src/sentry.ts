import * as Sentry from "@sentry/nextjs";

export const setSentryUser = (user) => {
    if (user) {
        setTimeout(function () {
            try {
                Sentry.setUser(user);
            } catch (ex) {
                console.log(ex);
            }
        }, 5000);
    }
};

export const setCharacterName = (name: string) => {
    setTag({ id: "character-name", value: name });
};

const setTag = (tag) => {
    if (tag) {
        try {
            Sentry.setTag(tag.id, tag.value);
        } catch (ex) {
            console.log(ex);
        }
    }
};
