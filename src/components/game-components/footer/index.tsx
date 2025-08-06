import { useURLContext } from "../../../_shared/react-contexts";
import { useTranslator } from "../../../_shared/react-hooks/use-translator";
import { ResourceTypes } from "../../../_shared/resources";

const Footer = () => {
    console.log("[Footer] Footer component rendering");
    const { t } = useTranslator();

    const copyrightText = t(`copyright-text`, {
        year: new Date().getFullYear(),
    }).replaceTolgeeFormat();

    console.log("[Footer] copyright text:", copyrightText);

    return (
        <h3 className="text-center copyright">
            {copyrightText}
        </h3>
    );
};

export default Footer;
