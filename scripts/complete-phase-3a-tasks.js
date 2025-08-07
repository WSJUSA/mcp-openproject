#!/usr/bin/env node

/**
 * Complete Phase 3A Tasks in OpenProject
 * 
 * This script marks all Phase 3A work packages as completed after successful implementation
 * of Material UI setup, Employee List Page, Employee Detail Page, Add Employee Page,
 * and Shared Component Library.
 * 
 * Usage: node complete-phase-3a-tasks.js
 */

import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const OPENPROJECT_URL = process.env.OPENPROJECT_URL;
const OPENPROJECT_API_KEY = process.env.OPENPROJECT_API_KEY;

if (!OPENPROJECT_URL || !OPENPROJECT_API_KEY) {
  console.error('❌ Missing OpenProject configuration in .env file');
  console.error('Required: OPENPROJECT_URL, OPENPROJECT_API_KEY');
  process.exit(1);
}

// Configure axios with SSL settings
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // For self-signed certificates
});

const headers = {
  'Authorization': `Basic ${Buffer.from(`apikey:${OPENPROJECT_API_KEY}`).toString('base64')}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

/**
 * Get project ID by name
 */
async function getProjectId() {
  try {
    const response = await axios.get(
      `${OPENPROJECT_URL}/api/v3/projects`,
      { headers, httpsAgent }
    );
    
    const project = response.data._embedded.elements.find(
      p => p.name === 'MTI Employee Management System Enhancement' || 
           p.identifier === 'mti-employee-enhancement'
    );
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    return project.id;
  } catch (error) {
    console.error('Error getting project ID:', error.message);
    throw error;
  }
}

/**
 * Get available statuses
 */
async function getStatuses() {
  try {
    const response = await axios.get(
      `${OPENPROJECT_URL}/api/v3/statuses`,
      { headers, httpsAgent }
    );
    
    const statuses = {};
    response.data._embedded.elements.forEach(status => {
      statuses[status.name.toLowerCase()] = status.id;
    });
    
    return statuses;
  } catch (error) {
    console.error('Error getting statuses:', error.message);
    throw error;
  }
}

/**
 * Update work package status
 */
async function updateWorkPackageStatus(workPackageId, statusId, lockVersion) {
  try {
    const updateData = {
      lockVersion: lockVersion,
      _links: {
        status: {
          href: `${OPENPROJECT_URL}/api/v3/statuses/${statusId}`
        }
      }
    };
    
    const response = await axios.patch(
      `${OPENPROJECT_URL}/api/v3/work_packages/${workPackageId}`,
      updateData,
      { headers, httpsAgent }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error updating work package ${workPackageId}:`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Complete Phase 3A tasks
 */
async function completePhase3ATasks() {
  try {
    console.log('🎯 Completing Phase 3A Tasks in OpenProject...');
    console.log('============================================================');
    
    const projectId = await getProjectId();
    console.log(`📋 Project ID: ${projectId}`);
    
    // Get all work packages for the project
    const response = await axios.get(
      `${OPENPROJECT_URL}/api/v3/projects/${projectId}/work_packages?pageSize=100`,
      { headers, httpsAgent }
    );
    
    const workPackages = response.data._embedded.elements;
    console.log(`📦 Total work packages: ${workPackages.length}`);
    
    // Get status IDs
    const statuses = await getStatuses();
    console.log('📊 Available statuses:', Object.keys(statuses));
    
    // Find the "Closed" or "Resolved" status ID
    const completedStatusId = statuses['closed'] || statuses['resolved'] || statuses['done'] || statuses['completed'];
    
    if (!completedStatusId) {
      console.error('❌ Could not find a completion status (closed/resolved/done/completed)');
      console.log('Available statuses:', statuses);
      return;
    }
    
    console.log(`✅ Using completion status ID: ${completedStatusId}`);
    
    // Define Phase 3A work packages to complete
    const phase3ATaskSubjects = [
      'Material UI Setup & Theme Configuration',
      'Employee List Page with DataGrid', 
      'Employee Detail Page with Tabs',
      'Enhanced Add Employee Page with Stepper',
      'Shared Component Library'
    ];
    
    // Find Phase 3A work packages
    const phase3APackages = workPackages.filter(wp => {
      return phase3ATaskSubjects.some(subject => 
        wp.subject.includes(subject) || 
        wp.subject.includes('🎨 Material UI') ||
        wp.subject.includes('📋 Employee List') ||
        wp.subject.includes('👤 Employee Detail') ||
        wp.subject.includes('➕ Enhanced Add Employee') ||
        wp.subject.includes('🔧 Shared Component')
      );
    });
    
    console.log(`\n🎯 Found ${phase3APackages.length} Phase 3A work packages to complete:`);
    phase3APackages.forEach(wp => {
      console.log(`  📋 ${wp.id}: ${wp.subject} (Status: ${wp._links.status.title})`);
    });
    
    if (phase3APackages.length === 0) {
      console.log('⚠️  No Phase 3A work packages found to complete.');
      return;
    }
    
    // Update each Phase 3A work package to completed status
    console.log('\n🚀 Updating work package statuses...');
    let completedCount = 0;
    
    for (const wp of phase3APackages) {
      try {
        // Skip if already completed
        if (wp._links.status.title.toLowerCase().includes('closed') || 
            wp._links.status.title.toLowerCase().includes('resolved') ||
            wp._links.status.title.toLowerCase().includes('done') ||
            wp._links.status.title.toLowerCase().includes('completed')) {
          console.log(`  ⏭️  Already completed: ${wp.subject}`);
          continue;
        }
        
        await updateWorkPackageStatus(wp.id, completedStatusId, wp.lockVersion);
        console.log(`  ✅ Completed: ${wp.subject}`);
        completedCount++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`  ❌ Failed to complete: ${wp.subject} - ${error.message}`);
      }
    }
    
    // Add completion notes to Phase 3 parent if it exists
    const phase3Parent = workPackages.find(wp => 
      wp.subject.includes('Phase 3: Development Phase 1') ||
      wp.subject.includes('Phase 3A')
    );
    
    if (phase3Parent) {
      try {
        const completionNote = `\n\n## Phase 3A Implementation Completed ✅\n\n**Completion Date**: ${new Date().toISOString().split('T')[0]}\n\n**Completed Tasks**:\n${phase3ATaskSubjects.map(task => `- ✅ ${task}`).join('\n')}\n\n**Implementation Summary**:\n- Material UI successfully integrated with comprehensive theme\n- Employee List Page implemented with DataGrid and advanced features\n- Employee Detail Page created with tabbed interface\n- Add Employee Page built with multi-step Stepper\n- Shared Component Library established\n- TypeScript compilation successful\n- Development server running without errors\n\n**Technical Achievements**:\n- Responsive design for mobile and desktop\n- Permission-based access control\n- Material UI best practices followed\n- Seamless integration with existing React setup`;
        
        const updateData = {
          lockVersion: phase3Parent.lockVersion,
          description: {
            format: 'markdown',
            raw: (phase3Parent.description?.raw || '') + completionNote
          }
        };
        
        await axios.patch(
          `${OPENPROJECT_URL}/api/v3/work_packages/${phase3Parent.id}`,
          updateData,
          { headers, httpsAgent }
        );
        
        console.log(`  📝 Added completion notes to: ${phase3Parent.subject}`);
        
      } catch (error) {
        console.log(`  ⚠️  Could not update parent notes: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Phase 3A completion update finished!');
    console.log('============================================================');
    console.log('📊 Summary:');
    console.log(`  ✅ Work packages completed: ${completedCount}`);
    console.log(`  📋 Total Phase 3A packages: ${phase3APackages.length}`);
    console.log(`  🎯 Completion status used: ${completedStatusId}`);
    
    console.log('\n🔗 Next steps:');
    console.log('  1. Review completed work packages in OpenProject');
    console.log('  2. Plan Phase 3B implementation (if applicable)');
    console.log('  3. Conduct user testing of new Material UI interface');
    console.log('  4. Gather feedback for future improvements');
    
    console.log(`\n🌐 View project: ${OPENPROJECT_URL}/projects/mti-employee-enhancement`);
    
  } catch (error) {
    console.error('❌ Error completing Phase 3A tasks:', error.message);
    process.exit(1);
  }
}

// Run the completion script
console.log('🚀 Starting Phase 3A task completion...');
completePhase3ATasks().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});

export default completePhase3ATasks;