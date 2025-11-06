import React from "react";
import FeaturedMovies from "../components/Movies/FeaturedMovies";
import MovieCategories from "../components/Movies/MovieCategories";
import RecommendationSection from "../components/Recommendation/RecommendationSection";
import Offers from "../components/Offers/Offers";
import AnimatedSection from "../components/common/AnimatedSection";
import Trailers from "../components/Trailers/Trailers";

function HomePage() {
  return (
    <div className="w-full">
      <AnimatedSection animation="fadeIn" duration={800}>
        <FeaturedMovies />
      </AnimatedSection>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 mt-12">
        <AnimatedSection animation="slideUp" duration={200} reversible={true}>
          <MovieCategories />
        </AnimatedSection>
        <AnimatedSection animation="slideUp" delay={400} reversible={true}>
          <RecommendationSection />
        </AnimatedSection>
        <AnimatedSection animation="slideUp" delay={600} reversible={true}>
          <Trailers />
        </AnimatedSection>
        <AnimatedSection animation="slideUp" delay={800} reversible={true}>
          <Offers />
        </AnimatedSection>
      </div>
    </div>
  );
}

export default HomePage;
