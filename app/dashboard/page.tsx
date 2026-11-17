"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import DashboardNavbar from "@/components/DashboardNavbar";
import ChatbotButton from "@/components/ChatbotButton";
import {
    HiSearch,
    HiX,
    HiInformationCircle,
    HiStar,
    HiOutlineStar,
    HiCheck,
} from "react-icons/hi";
import { supabaseClient } from "@/lib/supabase-client";
import { useDialog } from "@/lib/useDialog";
import { useA11y } from "@/components/a11y/A11yProvider";
import PageBackdrop from "@/components/fx/PageBackdrop";
import ScrollProgress from "@/components/fx/ScrollProgress";
import DashboardHero from "@/components/dashboard/DashboardHero";
import RouteDivider from "@/components/dashboard/RouteDivider";
import SkeletonCard from "@/components/dashboard/SkeletonCard";
import EmptyState from "@/components/dashboard/EmptyState";
import BackToTop from "@/components/dashboard/BackToTop";
import ClubCard from "@/components/dashboard/ClubCard";
import SpotlightCard from "@/components/dashboard/SpotlightCard";
import { sectionIcon } from "@/components/dashboard/sectionIcon";
import { SECTION_STYLE, type DashboardSection } from "@/lib/communityData";
import { matchScore } from "@/lib/search";

/** Squash-and-stretch press for the dashboard's main buttons (instant, tiny, springy). */
const PRESS = { whileTap: { scaleX: 1.04, scaleY: 0.92 }, transition: { type: "spring", stiffness: 600, damping: 18 } } as const;

// the 3D GPS that holds the map (same component as the home page)
const Gps = dynamic(() => import("@/components/objects/Gps"), {
    ssr: false,
});
// heavy, decorative — only loaded once they're actually needed
const CategoryRings = dynamic(() => import("@/components/dashboard/CategoryRings"), { ssr: false });

export interface Club {
    id: string;
    name: string;
    description: string;
    members: number;
    location: string;
    meetingTime: string;
    lat: number;
    lng: number;
    category: string;
}
export interface Review {
    clubId: string;
    rating: number;
    comment: string;
    createdAt: string;
}

const SECTION_ORDER = [
    "Classes",
    "STEM",
    "Health & Wellness",
    "Community & Service",
    "Other",
] as const;

function getCategory(listing: {
    title?: string;
    name?: string;
    club_name?: string;
    description?: string;
    category?: string;
    type?: string;
    section?: string;
}): (typeof SECTION_ORDER)[number] {
    if (listing.category)
        return (SECTION_ORDER as readonly string[]).includes(listing.category)
            ? (listing.category as (typeof SECTION_ORDER)[number])
            : "Other";
    if (listing.type)
        return (SECTION_ORDER as readonly string[]).includes(listing.type)
            ? (listing.type as (typeof SECTION_ORDER)[number])
            : "Other";
    if (listing.section)
        return (SECTION_ORDER as readonly string[]).includes(listing.section)
            ? (listing.section as (typeof SECTION_ORDER)[number])
            : "Other";
    const text =
        `${listing.title || ""} ${listing.name || ""} ${listing.club_name || ""} ${(listing.description || "").toLowerCase()}`.toLowerCase();
    // Exclude "Echelon" from Classes category
    if (text.includes("echelon")) return "Other";
    if (
        /\b(ap |class|course|programming|calculus|computer science principles)\b/.test(
            text,
        )
    )
        return "Classes";
    if (/\b(stem|science|math|tech|engineering)\b/.test(text)) return "STEM";
    if (/\b(mental health|health|wellness|thrive|uplife)\b/.test(text))
        return "Health & Wellness";
    if (
        /\b(homeless|shelter|hope|helping|volunteer|foundation|community|donation|charity|run|stride|service)\b/.test(
            text,
        )
    )
        return "Community & Service";
    return "Other";
}

const EASE = [0.22, 1, 0.36, 1] as const;

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
    return (
        <motion.div
            className="mx-auto mb-10 max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE }}
        >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-300">
                {eyebrow}
            </span>
            <h2 className="relative mt-4 inline-block text-3xl font-extrabold tracking-tight text-white md:text-5xl" style={{ fontFamily: "Nunito, sans-serif" }}>
                {title}
                <motion.span
                    aria-hidden
                    className="absolute -bottom-2 left-0 h-[3px] w-full origin-left rounded-full bg-gradient-to-r from-teal-300 via-indigo-300 to-rose-300"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: EASE }}
                />
            </h2>
            {sub && <p className="mt-5 text-lg text-gray-400">{sub}</p>}
        </motion.div>
    );
}

export default function DashboardPage() {
    const { prefs } = useA11y();
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [displayCount, setDisplayCount] = useState(8);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
    const [showInfo, setShowInfo] = useState(false);
    const [showReviewPopup, setShowReviewPopup] = useState(false);
    const [reviewClub, setReviewClub] = useState<Club | null>(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(
        new Set(),
    );
    const [reviews, setReviews] = useState<Review[]>([]);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    // NEW: category filter driven by the tree / flow map / rings — independent of search
    const [activeSection, setActiveSection] = useState<DashboardSection | null>(null);
    const infoRef = useDialog<HTMLDivElement>(showInfo, () => setShowInfo(false));
    const reviewRef = useDialog<HTMLDivElement>(showReviewPopup && !!reviewClub, () => setShowReviewPopup(false));
    const locationsRef = useRef<HTMLDivElement>(null);
    const exploreRef = useRef<HTMLDivElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    // the review just posted, so its card can flash it (exaggerated feedback)
    const [justPosted, setJustPosted] = useState<string | null>(null);

    const openReview = (club: Club) => {
        setReviewClub(club);
        setReviewRating(0);
        setReviewComment("");
        setReviewSubmitted(false);
        setShowReviewPopup(true);
    };

    //  use effect to relaod and mount the page when saving to object.localstroage prop
    useEffect(() => {
        const storedReviews = localStorage.getItem("clubReviews");
        if (storedReviews) {
            setReviews(JSON.parse(storedReviews));
        }
    }, []);

    useEffect(() => {
        async function fetchClubs() {
            try {
                const { data, error } = await supabaseClient
                    .from("lisitngs")
                    .select("*");

                if (error) {
                    console.error("Error fetching clubs:", error);
                    console.error("Error details:", JSON.stringify(error, null, 2));
                    setLoading(false);
                    return;
                }

                console.log("Raw data from Supabase:", data);
                console.log("Number of records:", data?.length || 0);

                if (data && data.length > 0) {
                    console.log("First record sample:", data[0]);

                    const mappedClubs: Club[] = data
                        .map((listing: any) => {
                            const club = {
                                id: listing.id?.toString() || "",
                                name: listing.title || listing.name || listing.club_name || "",
                                description:
                                    listing.description || listing.desc || listing.about || "",
                                members:
                                    listing.members ||
                                    listing.member_count ||
                                    listing.memberCount ||
                                    0,
                                location:
                                    listing.location || listing.address || listing.venue || "",
                                meetingTime:
                                    listing.meeting_time ||
                                    listing.meetingTime ||
                                    listing.meeting ||
                                    listing.schedule ||
                                    "",
                                lat: parseFloat(listing.latitude || listing.lat || "35.2271"),
                                lng: parseFloat(
                                    listing.longitude || listing.lng || listing.lon || "-80.8431",
                                ),
                                category: getCategory(listing),
                            };
                            console.log("Mapped club:", club);
                            return club;
                        })
                        .filter((club: Club) => {
                            const isValid = club.name && !isNaN(club.lat) && !isNaN(club.lng);
                            if (!isValid) {
                                console.log(
                                    "Filtered out club (missing required fields):",
                                    club,
                                );
                            }
                            return isValid;
                        });

                    console.log("Final mapped clubs:", mappedClubs);
                    console.log("Number of valid clubs:", mappedClubs.length);
                    setClubs(mappedClubs);
                } else {
                    console.log("No data returned from Supabase");
                }
            } catch (error) {
                console.error("Error fetching clubs:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchClubs();
    }, []);

    // one forgiving search for both the suggestions and the list (see lib/search.ts):
    // any field, any word order, small typos OK, names ranked first
    const scoreClub = (club: Club) =>
        matchScore(searchQuery, [
            { text: club.name, weight: 3 },
            { text: club.category, weight: 2 },
            { text: club.location },
            { text: club.meetingTime },
            { text: club.description },
        ]);

    const scoredClubs = clubs
        .map((club) => ({ club, score: scoreClub(club) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score);

    const filteredClubs = scoredClubs.map(({ club }) => club);

    const suggestions =
        searchQuery.trim() && !selectedClubId && clubs.length > 0 ? filteredClubs.slice(0, 5) : [];

    const handleSuggestionClick = (club: Club) => {
        setSelectedClubId(club.id);
        setSearchQuery(club.name);
        setDisplayCount(8);
        setActiveSuggestion(-1);
    };

    // Combobox keyboard support: arrows move through suggestions, Enter picks one, Escape clears
    const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown" && suggestions.length) {
            e.preventDefault();
            setActiveSuggestion((i) => (i + 1) % suggestions.length);
        } else if (e.key === "ArrowUp" && suggestions.length) {
            e.preventDefault();
            setActiveSuggestion((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
        } else if (e.key === "Enter" && activeSuggestion >= 0 && suggestions[activeSuggestion]) {
            e.preventDefault();
            handleSuggestionClick(suggestions[activeSuggestion]);
        } else if (e.key === "Escape") {
            setSearchQuery("");
            setSelectedClubId(null);
            setActiveSuggestion(-1);
        }
    };

    const displayedClubs = selectedClubId
        ? clubs.filter((club) => club.id === selectedClubId)
        : filteredClubs;

    const clubsBySection = SECTION_ORDER.map((section) => ({
        section,
        clubs: displayedClubs.filter((c) => c.category === section),
    })).filter(({ clubs }) => clubs.length > 0);

    // the tree/flow/rings category filter only affects which sections are shown below —
    // it never touches the search/selection state above
    const visibleSections = activeSection
        ? clubsBySection.filter(({ section }) => section === activeSection)
        : clubsBySection;

    useEffect(() => {
        setDisplayCount(8);
    }, [searchQuery, selectedClubId]);

    const toggleDescription = (clubId: string) => {
        setExpandedDescriptions((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(clubId)) {
                newSet.delete(clubId);
            } else {
                newSet.add(clubId);
            }
            return newSet;
        });
    };

    const scrollToRef = (ref: React.RefObject<HTMLElement>) => {
        ref.current?.scrollIntoView({ behavior: prefs.reduceMotion ? "auto" : "smooth", block: "start" });
    };

    return (
        <div className="relative min-h-screen overflow-x-clip bg-black">
            <ScrollProgress />
            <PageBackdrop />
            <DashboardNavbar />
            <ChatbotButton />
            <BackToTop reduceMotion={prefs.reduceMotion} />

            <main id="main" tabIndex={-1} className="relative z-10 pt-32 pb-24 px-4 md:px-12 outline-none">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="max-w-7xl mx-auto"
                >
                    <div className="flex items-center gap-4 mb-2">
                        <h1
                            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white"
                            style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700 }}
                        >
                            Dashboard
                        </h1>
                        <button
                            type="button"
                            onClick={() => setShowInfo(true)}
                            className="rounded-full p-1.5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                            aria-label="How to use the dashboard"
                            aria-haspopup="dialog"
                        >
                            <HiInformationCircle aria-hidden="true" className="h-8 w-8 md:h-10 md:w-10" />
                        </button>
                    </div>

                    {/* Search sits at the very top: it's the thing people use most (frequency of use) */}
                    <div className="relative z-40 mb-10 mt-6">
                        <label htmlFor="listing-search" className="mb-2 block text-sm font-semibold text-gray-300">
                            Search listings by name, category, location or meeting time
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <HiSearch aria-hidden="true" className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="listing-search"
                                type="search"
                                role="combobox"
                                aria-autocomplete="list"
                                aria-expanded={suggestions.length > 0}
                                aria-controls="listing-suggestions"
                                aria-describedby="search-help"
                                aria-activedescendant={activeSuggestion >= 0 && suggestions[activeSuggestion] ? `suggestion-${suggestions[activeSuggestion].id}` : undefined}
                                autoComplete="off"
                                placeholder="e.g. tutoring, STEM, Ballantyne..."
                                value={searchQuery}
                                onKeyDown={onSearchKeyDown}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setSelectedClubId(null);
                                    setActiveSuggestion(-1);
                                }}
                                className="w-full bg-black/50 border-2 border-gray-700 rounded-xl pl-12 pr-14 py-4 text-white placeholder-gray-400 focus:border-indigo-300 transition-colors duration-150 font-sans [&::-webkit-search-cancel-button]:hidden focus:shadow-[0_0_30px_-8px_rgba(165,180,252,0.7)]"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    aria-label="Clear search"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedClubId(null);
                                        setActiveSuggestion(-1);
                                    }}
                                    className="absolute inset-y-0 right-0 flex w-14 items-center justify-center rounded-r-xl text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    <HiX aria-hidden="true" className="h-5 w-5" />
                                </button>
                            )}
                            {suggestions.length > 0 && (
                                <ul id="listing-suggestions" role="listbox" aria-label="Search suggestions" className="absolute z-50 w-full mt-2 bg-black border-2 border-gray-700 rounded-xl overflow-hidden shadow-2xl">
                                    {suggestions.map((club, i) => (
                                        <motion.li
                                            key={club.id}
                                            id={`suggestion-${club.id}`}
                                            role="option"
                                            aria-selected={i === activeSuggestion}
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => handleSuggestionClick(club)}
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.12, delay: prefs.reduceMotion ? 0 : i * 0.03 }}
                                            className={`w-full cursor-pointer text-left px-4 py-3 hover:bg-gray-900 transition-colors border-b border-gray-800 last:border-b-0 ${i === activeSuggestion ? "bg-gray-800" : ""}`}
                                        >
                                            <div className="text-white font-semibold font-sans">
                                                {club.name}
                                            </div>
                                            {club.location &&
                                                club.location !== "TBD" &&
                                                club.location !== "Location TBD" && (
                                                    <div className="text-gray-400 text-sm font-sans mt-1">
                                                        {club.location}
                                                    </div>
                                                )}
                                            {club.meetingTime && club.meetingTime !== "TBD" && (
                                                <div className="text-gray-400 text-xs font-sans mt-1">
                                                    {club.meetingTime}
                                                </div>
                                            )}
                                        </motion.li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="mt-2 flex min-h-[44px] flex-wrap items-center justify-between gap-2">
                            <p id="search-help" className="text-sm text-gray-400">
                                Small typos are fine. Pick a suggestion to set it as the GPS destination.
                            </p>
                            {searchQuery.trim() && (
                                <button
                                    type="button"
                                    onClick={() => scrollToRef(resultsRef)}
                                    className="inline-flex min-h-[44px] items-center rounded-xl border border-white/15 px-4 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
                                >
                                    See {displayedClubs.length} result{displayedClubs.length === 1 ? "" : "s"} ↓
                                </button>
                            )}
                        </div>
                        <p role="status" className="sr-only">
                            {searchQuery.trim() ? `${suggestions.length} suggestions, ${displayedClubs.length} matching listings` : ""}
                        </p>
                    </div>

                    {showInfo && (
                        <div
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowInfo(false)}
                        >
                            <motion.div
                                ref={infoRef}
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="dashboard-guide-title"
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 0.85 }}
                                transition={{ duration: 0.2 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-black border-2 border-gray-700 rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 id="dashboard-guide-title" className="text-3xl md:text-4xl font-bold text-white font-sans">
                                        Dashboard Guide
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => setShowInfo(false)}
                                        aria-label="Close dashboard guide"
                                        className="-m-2.5 rounded-full p-2.5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                    >
                                        <HiX aria-hidden="true" className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="space-y-4 text-gray-300 font-sans">
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-2">
                                            Resource Locations Map
                                        </h3>
                                        <p className="text-gray-400">
                                            Press the screen of the GPS to pull out the map of all
                                            resource locations. Select any pin, or a name in the list
                                            beside the map, to see its details.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-2">
                                            Search Functionality
                                        </h3>
                                        <p className="text-gray-400">
                                            Type in the search bar at the top to find a club, category,
                                            service or location (small typos are fine). Use the arrow keys
                                            or your mouse to pick a suggestion; the GPS sets it as your
                                            destination and the list below is filtered.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-2">
                                            Club Information
                                        </h3>
                                        <p className="text-gray-400">
                                            Browse all available clubs and classes below, organized by
                                            categories (Classes, STEM, Health & Wellness, Community &
                                            Service, and Other). Each card shows the name and
                                            description. Use the &quot;Show more&quot; button to see
                                            additional items.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-2">
                                            Navigation
                                        </h3>
                                        <p className="text-gray-400">
                                            Use the navigation bar at the top to access Home, About,
                                            Resources, Join Us, Sources, or log out of your account.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-2">
                                            Reviews
                                        </h3>
                                        <p className="text-gray-400">
                                            Select &quot;Leave Review&quot; on any listing to rate it from one
                                            to five stars and add an anonymous comment.
                                        </p>
                                    </div>
                                </div>

                                <motion.button
                                    type="button"
                                    onClick={() => setShowInfo(false)}
                                    {...PRESS}
                                    className="mt-6 w-full bg-black border-2 border-gray-600 text-white hover:bg-gray-900 hover:border-gray-500 px-6 py-3 rounded-xl transition-colors duration-150 font-sans font-semibold"
                                >
                                    Got it
                                </motion.button>
                            </motion.div>
                        </div>
                    )}

                    <DashboardHero
                        clubs={clubs}
                        loading={loading}
                        reduceMotion={prefs.reduceMotion}
                        onOpenMap={() => scrollToRef(locationsRef)}
                        onBrowseCategories={() => scrollToRef(exploreRef)}
                    />

                    <RouteDivider reduceMotion={prefs.reduceMotion} />

                    <div ref={locationsRef} className="mb-12 scroll-mt-28 pt-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-sans">
                            Locations
                        </h2>
                        <div className="theme-night rounded-3xl border border-white/10 bg-black px-4 py-6">
                            <Gps
                                listings={clubs}
                                status={loading ? "loading" : "ready"}
                                selectedId={selectedClubId}
                                member
                            />
                            <p className="mx-auto max-w-xl text-center text-gray-300">
                                Press the GPS screen to pull out the map. Pick a suggestion in the search bar at the top first and the GPS sets it as your destination.
                            </p>
                        </div>
                        <p className="mt-3 text-sm text-gray-300">
                            Every pin on the map is also listed below with its location and meeting time, so you can browse without using the map.
                        </p>
                    </div>

                    <RouteDivider reduceMotion={prefs.reduceMotion} />

                    {/* ============ explore the real listings by category ============ */}
                    {/* hidden while searching so the results sit right under the map */}
                    <div ref={exploreRef} className={`mb-16 scroll-mt-28 pt-10 ${searchQuery.trim() ? "hidden" : ""}`}>
                        <SectionHeading eyebrow="Explore" title="Every listing, by category" sub="A live breakdown of the same real listings loaded above." />

                        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10">
                            <h3 className="mb-6 text-center text-xl font-bold text-white font-sans">Categories at a Glance</h3>
                            {!loading && clubs.length > 0 && (
                                <CategoryRings clubs={clubs} activeSection={activeSection} onSelectSection={setActiveSection} reduceMotion={prefs.reduceMotion} highContrast={prefs.highContrast} />
                            )}
                        </div>
                    </div>

                    <RouteDivider reduceMotion={prefs.reduceMotion} />

                    {/* Spotlight Section */}
                    {!selectedClubId && !searchQuery.trim() && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35 }}
                            className="mb-12 pt-10"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-sans">
                                Spotlight
                            </h2>
                            <div className="flex flex-col gap-6 w-full">
                                {[
                                    "Essam",
                                    "Homeless Hearth",
                                    "Uplife",
                                    "Every Student Succeeds at Math",
                                ].map((spotlightName, index) => {
                                    const spotlightClub = clubs.find((c) =>
                                        c.name.toLowerCase().includes(spotlightName.toLowerCase()),
                                    );

                                    if (!spotlightClub) return null;

                                    return (
                                        <SpotlightCard key={spotlightClub.id} index={index} reduceMotion={prefs.reduceMotion}>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider font-sans relative">
                                                    <span className="text-shimmer">Featured</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    aria-haspopup="dialog"
                                                    aria-label={`Leave a review for ${spotlightClub.name}`}
                                                    onClick={() => openReview(spotlightClub)}
                                                    className="-mr-3 inline-flex min-h-[44px] items-center rounded-lg px-3 text-gray-300 hover:bg-white/5 hover:text-yellow-400 transition-colors text-sm font-sans"
                                                >
                                                    Leave Review
                                                </button>
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-3 font-sans">
                                                {spotlightClub.name}
                                            </h3>
                                            <div className="mb-4">
                                                <p
                                                    className={`text-gray-400 text-sm leading-relaxed ${expandedDescriptions.has(spotlightClub.id) ? "" : "line-clamp-3"}`}
                                                >
                                                    {spotlightClub.description}
                                                </p>
                                                {spotlightClub.description &&
                                                    spotlightClub.description.length > 100 && (
                                                        <button
                                                            type="button"
                                                            aria-expanded={expandedDescriptions.has(spotlightClub.id)}
                                                            onClick={() =>
                                                                toggleDescription(spotlightClub.id)
                                                            }
                                                            className="-ml-2 inline-flex min-h-[44px] items-center rounded-lg px-2 text-gray-400 hover:text-white text-xs font-semibold transition-colors font-sans"
                                                        >
                                                            {expandedDescriptions.has(spotlightClub.id)
                                                                ? "Show less"
                                                                : "Show more..."}
                                                        </button>
                                                    )}
                                            </div>
                                            <div className="flex flex-col gap-2 text-xs text-gray-400 font-sans">
                                                {spotlightClub.location &&
                                                    spotlightClub.location !== "TBD" &&
                                                    spotlightClub.location !== "Location TBD" && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold">Location:</span>
                                                            <span>{spotlightClub.location}</span>
                                                        </div>
                                                    )}
                                                {spotlightClub.meetingTime &&
                                                    spotlightClub.meetingTime !== "TBD" && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold">Meeting:</span>
                                                            <span>{spotlightClub.meetingTime}</span>
                                                        </div>
                                                    )}
                                            </div>
                                        </SpotlightCard>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    <div ref={resultsRef} className="mb-8 flex scroll-mt-28 flex-wrap items-center gap-3">
                        <h2 className="text-3xl md:text-4xl font-bold text-white font-sans">
                            {selectedClubId
                                ? clubs.find((c) => c.id === selectedClubId)?.name || "Club"
                                : searchQuery.trim()
                                    ? `Search Results (${displayedClubs.length})`
                                    : "All Listings"}
                        </h2>
                        {activeSection && (
                            <span
                                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider"
                                style={{ borderColor: `${SECTION_STYLE[activeSection].hex}55`, background: `${SECTION_STYLE[activeSection].hex}1a`, color: SECTION_STYLE[activeSection].hex }}
                            >
                                Filtered to {activeSection}
                                {/* visible circle stays small; the invisible ::after pad makes the target 44×44 */}
                                <button
                                    type="button"
                                    onClick={() => setActiveSection(null)}
                                    aria-label="Clear category filter"
                                    className="relative -my-1 -mr-2 ml-1 grid h-7 w-7 place-items-center rounded-full hover:bg-white/15 after:absolute after:-inset-2 after:content-['']"
                                >
                                    <HiX aria-hidden="true" className="h-4 w-4" />
                                </button>
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="status" aria-label="Loading listings">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : displayedClubs.length === 0 ? (
                        clubs.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-white text-lg font-semibold font-sans mb-2" role="status">Listings are unavailable right now.</p>
                                <p className="text-gray-300 text-sm font-sans">Please refresh the page in a moment. If the problem continues, contact us through the Join Us page.</p>
                            </div>
                        ) : (
                            <EmptyState reduceMotion={prefs.reduceMotion} />
                        )
                    ) : visibleSections.length === 0 ? (
                        <EmptyState reduceMotion={prefs.reduceMotion} />
                    ) : (
                        <>
                            <div className="space-y-14">
                                {visibleSections.map(({ section, clubs: sectionClubs }, sectionIndex) => (
                                    <motion.section
                                        key={section}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: sectionIndex * 0.05 }}
                                        className="space-y-6"
                                    >
                                        <h2 className="inline-flex items-center gap-2 text-2xl md:text-3xl font-bold text-white font-sans border-b border-gray-700 pb-2">
                                            {(() => {
                                                const Icon = sectionIcon(section as DashboardSection);
                                                return <Icon aria-hidden="true" className="h-6 w-6" style={{ color: SECTION_STYLE[section as DashboardSection].hex }} />;
                                            })()}
                                            {section}
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {sectionClubs
                                                .slice(0, sectionIndex === 0 ? displayCount : undefined)
                                                .map((club, index) => {
                                                    const clubReviews = reviews
                                                        .filter((r) => r.clubId === club.id)
                                                        .sort((a, b) =>
                                                            b.createdAt.localeCompare(a.createdAt),
                                                        );

                                                    return (
                                                        <ClubCard
                                                            key={club.id}
                                                            club={club}
                                                            section={section as DashboardSection}
                                                            reviews={clubReviews}
                                                            expanded={expandedDescriptions.has(club.id)}
                                                            onToggleDescription={() => toggleDescription(club.id)}
                                                            onOpenReview={() => openReview(club)}
                                                            index={index}
                                                            highContrast={prefs.highContrast}
                                                            highlightReview={justPosted}
                                                            reduceMotion={prefs.reduceMotion}
                                                        />
                                                    );
                                                })}
                                        </div>
                                        {sectionIndex === 0 && sectionClubs.length > displayCount && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDisplayCount((prev) =>
                                                        Math.min(prev + 8, sectionClubs.length),
                                                    )
                                                }
                                                className="inline-flex min-h-[44px] items-center rounded-xl border border-white/15 px-5 text-gray-300 hover:bg-white/5 hover:text-white text-sm font-semibold transition-colors"
                                            >
                                                Show more in {section} ({sectionClubs.length - displayCount}{" "}
                                                more)
                                            </button>
                                        )}
                                    </motion.section>
                                ))}
                            </div>
                        </>
                    )}
                </motion.div>
            </main>

            {/* Review Popup */}

            {showReviewPopup && reviewClub && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={() => setShowReviewPopup(false)}
                >
                    <motion.div
                        ref={reviewRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="review-title"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-black border-2 border-gray-700 rounded-3xl p-8 md:p-10 max-w-lg w-full mx-4 shadow-2xl overflow-hidden"
                    >
                        {!reviewSubmitted ? (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 id="review-title" className="text-2xl md:text-3xl font-bold text-white font-sans">
                                        Leave a Review
                                    </h2>
                                    <button
                                        type="button"
                                        aria-label="Close review form"
                                        onClick={() => setShowReviewPopup(false)}
                                        className="-m-2.5 rounded-full p-2.5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                    >
                                        <HiX aria-hidden="true" className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold text-white mb-2 font-sans">
                                        {reviewClub.name}
                                    </h3>
                                    <p className="text-gray-400 text-sm font-sans">
                                        {reviewClub.description}
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <p id="rating-label" className="block text-sm font-semibold text-gray-300 mb-3 font-sans">
                                        Rating <span className="font-normal text-gray-400">(required)</span>
                                    </p>
                                    <div
                                        className="-ml-2 flex gap-1"
                                        role="radiogroup"
                                        aria-labelledby="rating-label"
                                        onKeyDown={(e) => {
                                            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                                                e.preventDefault();
                                                setReviewRating((r) => Math.min(5, r + 1));
                                            } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                                                e.preventDefault();
                                                setReviewRating((r) => Math.max(1, r - 1));
                                            }
                                        }}
                                    >
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <motion.button
                                                key={star}
                                                type="button"
                                                role="radio"
                                                aria-checked={star === reviewRating}
                                                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                                                tabIndex={star === (reviewRating || 1) ? 0 : -1}
                                                onClick={() => setReviewRating(star)}
                                                whileHover={{ scale: 1.25 }}
                                                whileTap={{ scale: 0.9 }}
                                                animate={star <= reviewRating ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                                                transition={{ duration: 0.2 }}
                                                className="rounded-lg p-2 text-3xl transition-colors"
                                            >
                                                {star <= reviewRating ? (
                                                    <HiStar aria-hidden="true" className="text-yellow-400" />
                                                ) : (
                                                    <HiOutlineStar aria-hidden="true" className="text-gray-400 hover:text-gray-200" />
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label
                                        htmlFor="review-comment"
                                        className="block text-sm font-semibold text-gray-300 mb-2 font-sans"
                                    >
                                        Comment
                                    </label>
                                    <textarea
                                        id="review-comment"
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        placeholder="Share your experience with this club..."
                                        rows={4}
                                        className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors font-sans resize-none"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <motion.button
                                        type="button"
                                        onClick={() => setShowReviewPopup(false)}
                                        {...PRESS}
                                        className="flex-1 px-6 py-3 font-sans font-semibold text-white transition-colors duration-150 border-2 border-gray-600 hover:bg-gray-900 hover:border-gray-500 rounded-xl"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        {...(reviewRating === 0 ? {} : PRESS)}
                                        onClick={() => {
                                            const newReview: Review = {
                                                clubId: reviewClub.id,
                                                rating: reviewRating,
                                                comment: reviewComment,
                                                createdAt: new Date().toISOString(),
                                            };

                                            const updatedReviews = [...reviews, newReview];

                                            setReviews(updatedReviews);
                                            localStorage.setItem(
                                                "clubReviews",
                                                JSON.stringify(updatedReviews),
                                            );

                                            setReviewSubmitted(true);

                                            setTimeout(() => {
                                                // the card flashes this review once the dialog closes
                                                setJustPosted(newReview.createdAt);
                                                setShowReviewPopup(false);
                                                setReviewClub(null);
                                                setReviewRating(0);
                                                setReviewComment("");
                                                setReviewSubmitted(false);
                                            }, 1500);
                                        }}
                                        disabled={reviewRating === 0}
                                        className="flex-1 px-6 py-3 font-sans font-semibold text-black transition-colors duration-150 bg-white hover:bg-gray-100 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Send
                                    </motion.button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8" role="status">
                                {/* confetti burst in the club's category colour */}
                                {!prefs.reduceMotion && (
                                    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                                        {Array.from({ length: 18 }).map((_, i) => {
                                            const section = (SECTION_ORDER as readonly string[]).includes(reviewClub.category)
                                                ? (reviewClub.category as DashboardSection)
                                                : "Other";
                                            const angle = (i / 18) * Math.PI * 2;
                                            const dist = 90 + (i % 4) * 30;
                                            return (
                                                <motion.span
                                                    key={i}
                                                    className="absolute left-1/2 top-1/3 h-2 w-2 rounded-sm"
                                                    style={{ background: SECTION_STYLE[section].hex }}
                                                    initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                                                    animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist + 40, opacity: 0, rotate: 180 }}
                                                    transition={{ duration: 0.9, ease: "easeOut" }}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                                {/* check pops in with an overshoot (anticipation dip, then follow-through settle) */}
                                <motion.div
                                    className="mb-4"
                                    initial={prefs.reduceMotion ? false : { scale: 0.4, rotate: -25, opacity: 0 }}
                                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 520, damping: 14 }}
                                >
                                    <HiCheck aria-hidden="true" className="h-16 w-16 text-white mx-auto" />
                                </motion.div>
                                <h2 id="review-title" className="text-2xl md:text-3xl font-bold text-white mb-4 font-sans">
                                    Review Posted!
                                </h2>
                                <p className="text-gray-300 font-sans">
                                    Your review of {reviewClub.name} has been added. Thank you for
                                    your feedback!
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
}
