import { useNavigation } from "@remix-run/react";
import { PageSkeleton } from "app/components/Skeletons/PageSkeleton";


export function useNavigationSkeleton() {
    const navigation = useNavigation();
    if (navigation.state === "loading" && navigation.location) {

        const isTargetPages = navigation.location.pathname === "/pages";
        return isTargetPages ?
            <PageSkeleton mode="fullWidth" /> :
            <PageSkeleton />;

    }

    return null;
}

