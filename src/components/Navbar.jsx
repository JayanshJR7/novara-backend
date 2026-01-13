import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
import { FiShoppingBag, FiHeart, FiUser } from 'react-icons/fi';
import { productsAPI, categoriesAPI } from '../services/api';
import './Navbar.css';

const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const [extraCategories, setExtraCategories] = useState([]);
  const [isExtensionOpen, setIsExtensionOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount, wishlistCount } = useCart();

  const navRef = useRef(null);
  const logoRef = useRef(null);
  const extensionRef = useRef(null);
  const categoriesRef = useRef([]);
  const iconsRef = useRef([]);
  const mobileMenuRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useLayoutEffect(() => {
    if (!hasAnimated && categories.length > 0) {
      const ctx = gsap.context(() => {
        gsap.set(navRef.current, {
          y: 0,
          opacity: 1,
          force3D: true
        });

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          onComplete: () => setHasAnimated(true)
        });

        tl.from(logoRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: "power1.out"
        });

        tl.from(categoriesRef.current, {
          opacity: 0,
          y: 10,
          stagger: 0.05,
          duration: 0.4,
          ease: "power1.out"
        }, "-=0.3");

        tl.from(iconsRef.current, {
          opacity: 0,
          scale: 0.9,
          stagger: 0.05,
          duration: 0.3,
          ease: "power1.out"
        }, "-=0.3");
      });

      return () => ctx.revert();
    }
  }, [categories, hasAnimated]);

  useLayoutEffect(() => {
    let lastScroll = 0;
    let ticking = false;

    const updateNavbar = (currentScroll) => {
      if (currentScroll > lastScroll && currentScroll > 150) {
        gsap.to(navRef.current, {
          y: -100,
          duration: 0.4,
          ease: "power2.inOut",
          force3D: true
        });
        // Close extension when scrolling down
        if (isExtensionOpen) {
          handleExtensionClose();
        }
      } else if (currentScroll < lastScroll) {
        gsap.to(navRef.current, {
          y: 0,
          duration: 0.4,
          ease: "power2.out",
          force3D: true
        });
      }

      lastScroll = currentScroll;
      ticking = false;
    };

    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: 99999,
      onUpdate: (self) => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            updateNavbar(self.scroll());
          });
          ticking = true;
        }
      }
    });

    ScrollTrigger.create({
      trigger: "body",
      start: "top -10",
      toggleClass: { targets: navRef.current, className: "scrolled" },
      onEnter: () => {
        gsap.to(navRef.current, {
          backgroundColor: "rgba(255, 255, 255, 0)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          duration: 0.3,
          ease: "none"
        });
      },
      onLeaveBack: () => {
        gsap.to(navRef.current, {
          backgroundColor: "rgba(255, 255, 255, 0)",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
          duration: 0.3,
          ease: "none"
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isExtensionOpen]);

  useEffect(() => {
    if (mobileMenuRef.current) {
      if (isMobileMenuOpen) {
        gsap.fromTo(mobileMenuRef.current,
          {
            height: 0,
            opacity: 0
          },
          {
            height: "auto",
            opacity: 1,
            duration: 0.3,
            ease: "power2.out"
          }
        );
      } else if (mobileMenuRef.current.style.height !== "0px") {
        gsap.to(mobileMenuRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.25,
          ease: "power2.in"
        });
      }
    }
  }, [isMobileMenuOpen]);

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getNavbarCategories();

      const sortedCategories = (data.categories || [])
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(cat => ({
          name: cat.name,
          value: cat.slug
        }));

      const MAX_NAVBAR_CATEGORIES = 7;
      setCategories(sortedCategories.slice(0, MAX_NAVBAR_CATEGORIES));
      setExtraCategories(sortedCategories.slice(MAX_NAVBAR_CATEGORIES));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
      setExtraCategories([]);
    }
  };

  const handleExtensionOpen = () => {
    clearTimeout(hoverTimeoutRef.current);
    setIsExtensionOpen(true);
    
    if (extensionRef.current) {
      gsap.fromTo(
        extensionRef.current,
        {
          height: 0,
          opacity: 0,
          y: -20
        },
        {
          height: "auto",
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out"
        }
      );
    }
  };

  const handleExtensionClose = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      if (extensionRef.current) {
        gsap.to(extensionRef.current, {
          height: 0,
          opacity: 0,
          y: -20,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => setIsExtensionOpen(false)
        });
      }
    }, 200);
  };

  const handleExtensionMouseEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
  };

  return (
    <>
      <nav className="navbar" ref={navRef}>
        <div className="navbar-container">

          <div className="navbar-left">
            <Link to="/" className="logo" ref={logoRef}>
              <img src="/images/LOGO.PNG" alt="Novara-Jewels Brand logo" className='navLogo' />
            </Link>
          </div>

          <div className="navbar-center">
            <ul className="categories-list">
              {categories.map((category, index) => (
                <li key={index}
                  ref={(el) => (categoriesRef.current[index] = el)}>
                  <Link to={`/products?category=${category.value}`}>
                    {category.name}
                  </Link>
                </li>
              ))}

              {extraCategories.length > 0 && (
                <li
                  className="all-categories-trigger"
                  onMouseEnter={handleExtensionOpen}
                  onMouseLeave={handleExtensionClose}
                >
                  <span className="all-link">
                    All ▾
                  </span>
                </li>
              )}
            </ul>
          </div>

          <div className="navbar-right">
            <Link to="/wishlist" className="icon-link" ref={(el) => (iconsRef.current[0] = el)}>
              <FiHeart />
              {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
            </Link>

            <Link to="/cart" className="icon-link" ref={(el) => (iconsRef.current[1] = el)}>
              <FiShoppingBag />
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </Link>

            {isAuthenticated ? (
              <div className="user-menu" ref={(el) => (iconsRef.current[2] = el)}>
                <Link to="/profile" className="icon-link">
                  <FiUser />
                </Link>
                <div className="user-dropdown">
                  <p className='welcomeText'>Welcome <br /> {user?.name}</p>
                  <Link to="/profile">My Profile</Link>
                  <Link to="/profile">My Orders</Link>
                  {user?.isAdmin && <Link to="/admin">Admin Dashboard</Link>}
                  <button onClick={logout}>Logout</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="login-btn" ref={(el) => (iconsRef.current[2] = el)}>
                <FiUser className='login-icon' />
              </Link>
            )}

            <button
              className={`mobile-toggle ${isMobileMenuOpen ? "open" : ""}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              ref={(el) => (iconsRef.current[3] = el)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="mobile-menu" ref={mobileMenuRef}>
            {[...categories, ...extraCategories].map((category, index) => (
              <Link
                key={index}
                to={`/products?category=${category.value}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}

            {!isAuthenticated && (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                Login
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Desktop Categories Extension */}
      {isExtensionOpen && extraCategories.length > 0 && (
        <div
          className="navbar-extension"
          ref={extensionRef}
          onMouseEnter={handleExtensionMouseEnter}
          onMouseLeave={handleExtensionClose}
        >
          <div className="extension-container">
            <div className="extension-grid">
              {extraCategories.map((category, index) => (
                <Link
                  key={index}
                  to={`/products?category=${category.value}`}
                  className="extension-category"
                  onClick={() => handleExtensionClose()}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;