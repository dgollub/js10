#!/usr/bin/ruby
require "sass"
options = {
    :syntax => :scss,
    :style => :compressed,
    :sourcemap => :inline,
    :load_paths => ['./sass/']
    # load_paths is required in case your 'app.scss' files use @import to attach other scss files 
}

render = Sass::Engine.new(File.read("scss/app.scss"), options).render
File.write("dist/app.css", render)

