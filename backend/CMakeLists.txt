cmake_minimum_required(VERSION 3.28)

# Include vcpkg toolchain file
set(CMAKE_TOOLCHAIN_FILE "${CMAKE_CURRENT_SOURCE_DIR}/vcpkg/scripts/buildsystems/vcpkg.cmake"
  CACHE STRING "Vcpkg toolchain file")

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_DEBUG ${CMAKE_BINARY_DIR}/Debug)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_RELEASE ${CMAKE_BINARY_DIR}/Release)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY_DEBUG ${CMAKE_BINARY_DIR}/Debug)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY_RELEASE ${CMAKE_BINARY_DIR}/Release)
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY_DEBUG ${CMAKE_BINARY_DIR}/Debug)
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY_RELEASE ${CMAKE_BINARY_DIR}/Release)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON) # does not produce the json file
set(CMAKE_EXPORT_COMPILE_COMMANDS ON CACHE INTERNAL "") 

set (CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR})
set (CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR})

add_definitions(-DNAPI_VERSION=3)

project(trackaudio-afv)

# Set the C++ standard to C++17
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(${CMAKE_SOURCE_DIR}/extern/afv-native/include)

add_library(trackaudio-afv SHARED 
  src/main.cpp
  ${CMAKE_JS_SRC})

# Find the required packages
find_package(httplib CONFIG REQUIRED)
find_package(unofficial-node-addon-api CONFIG REQUIRED)
find_package(OpenSSL REQUIRED)
find_package(absl CONFIG REQUIRED)

if (WIN32)
  find_library(LIB_AFV afv_native PATHS ${CMAKE_SOURCE_DIR}/extern/afv-native/windows/$<CONFIGURATION> NO_DEFAULT_PATH)
  if(NOT LIB_AFV)
      message(FATAL_ERROR "libafv library not found")
  endif()
  message(STATUS "libafv: ${LIB_AFV}")
endif()

if (APPLE)
  find_library(LIB_AFV afv_native PATHS ${CMAKE_SOURCE_DIR}/extern/afv-native/macos/ NO_DEFAULT_PATH)
  if(NOT LIB_AFV)
      message(FATAL_ERROR "libafv library not found")
  endif()
  message(STATUS "libafv: ${LIB_AFV}")
endif()

if (UNIX AND NOT APPLE)
    #afv
    find_library(LIB_AFV afv_native PATHS ${CMAKE_SOURCE_DIR}/extern/afv-native/linux/ NO_DEFAULT_PATH)
    if(NOT LIB_AFV)
        message(FATAL_ERROR "libafv library not found")
    endif()
    message(STATUS "libafv: ${LIB_AFV}")
endif()

if(MSVC AND CMAKE_JS_NODELIB_DEF AND CMAKE_JS_NODELIB_TARGET)
  # Generate node.lib
  execute_process(COMMAND ${CMAKE_AR} /def:${CMAKE_JS_NODELIB_DEF} /out:${CMAKE_JS_NODELIB_TARGET} ${CMAKE_STATIC_LINKER_FLAGS})
endif()

set_target_properties(trackaudio-afv PROPERTIES PREFIX "" SUFFIX ".node")

target_include_directories(trackaudio-afv PRIVATE ${CMAKE_JS_INC})

target_link_libraries(trackaudio-afv PRIVATE 
    ${LIB_AFV}
    httplib::httplib
    unofficial::node-addon-api::node-addon-api
    OpenSSL::SSL OpenSSL::Crypto
    absl::strings absl::any absl::base
    ${CMAKE_JS_LIB})

# Set the output directory for the built executable
set_target_properties(trackaudio-afv
    PROPERTIES
        RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
)

add_custom_command(TARGET trackaudio-afv POST_BUILD  
    COMMAND ${CMAKE_COMMAND} -E copy_if_different  
        ${LIB_AFV}
        ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/$<CONFIG>)   

if (WIN32)
  add_custom_command(TARGET trackaudio-afv POST_BUILD
  COMMAND ${CMAKE_COMMAND} -E copy_directory
      ${CMAKE_SOURCE_DIR}/extern/afv-native/windows/$<CONFIGURATION>
      ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/$<CONFIG>)
endif()