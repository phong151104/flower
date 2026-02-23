import Navbar from "@/components/Navbar";
import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import BestSellers from "@/components/home/BestSellers";
import Categories from "@/components/home/Categories";
import FindPerfect from "@/components/home/FindPerfect";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
    return (
        <main>
            <Navbar />
            <HeroSection />
            <StatsSection />
            <BestSellers />
            <Categories />
            <FindPerfect />
            <Testimonials />
            <Newsletter />
            <Footer />
        </main>
    );
}
