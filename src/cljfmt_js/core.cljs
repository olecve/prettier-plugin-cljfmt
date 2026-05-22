(ns cljfmt-js.core
  (:require [cljfmt.core :as cljfmt]))

(defn format [source opts]
  (let [opts-clj (when (some? opts)
                   (js->clj opts :keywordize-keys true))]
    (if (empty? opts-clj)
      (cljfmt/reformat-string source)
      (cljfmt/reformat-string source opts-clj))))
